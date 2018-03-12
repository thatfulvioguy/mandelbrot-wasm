
extern crate image;

mod point;
mod sin_paint;
mod mandelbrot_paint;
mod colour;
mod complex;

use point::{Point, PlotSpace, point_resolver};
use mandelbrot_paint::paint_mandelbrot;
use sin_paint::sin_painter;

use std::f64;
use std::time::Instant;

use image::{RgbImage, ColorType};

fn print_time_since(start: Instant, desc: &str) {
    let elapsed = start.elapsed();
    let elapsed_micros = (elapsed.as_secs() * 1_000_000) as f64 + (elapsed.subsec_nanos() / 1000) as f64;
    println!("{} took {:.2}ms", desc, elapsed_micros / 1000.0)
}

#[cfg(target_arch="wasm32")]
fn main() {
    // Blank main required for wasm and asm.js
    // TODO check if that's still the case, especially if compiled as lib rather than binary
}

#[cfg(target_arch="wasm32")]
#[no_mangle]
pub extern "C" fn plot_mandelbrot(width: u32, height: u32, ss_scale: u32, centre_x: f64, centre_y: f64, plot_width: f64, plot_height: f64) -> *mut RgbImage {
    let mut img = RgbImage::new(width * ss_scale, width * ss_scale);
    let plot_space = PlotSpace::with_centre(Point::new(centre_x, centre_y), plot_width, plot_height);
    let resolve_point = point_resolver(img.width(), img.height(), plot_space);

    //let paint_point = sin_painter(0.05);
    let paint_point = paint_mandelbrot;

    let total_pixels = img.width() * img.height();

    let plot_start = Instant::now();

    for (n, (x, y, px)) in (1..).zip(img.enumerate_pixels_mut()) {
        let point = resolve_point(x, y);
        *px = paint_point(point);

        if n % (total_pixels / 20).max(1) == 0 {
            println!("Plotting: {:2.1}%", 100.0 * n as f64 / total_pixels as f64);
        }
    }

    print_time_since(plot_start, "Plotting");

    let final_img = if ss_scale > 1 {
        let resize_start = Instant::now();

        let resized_img = image::imageops::resize(&img, width, height, image::FilterType::Triangle);

        print_time_since(resize_start, "Resizing");

        resized_img
    } else {
        img
    };

    Box::into_raw(Box::new(final_img))
}

#[cfg(target_arch="wasm32")]
#[no_mangle]
pub extern "C" fn image_bytes_ptr(img_ptr: *mut RgbImage) -> *mut u8 {
    let img = unsafe { &mut *img_ptr };
    // ImageBuffer gives you the slice by implementing Deref, when it really shouldn't
    // You can get bytes_ptr by just doing img.as_mut_ptr() but it's best to illustrate this weird API design decision
    let img_bytes_slice = &mut (**img);
    let bytes_ptr = img_bytes_slice.as_mut_ptr();

    bytes_ptr
}

#[cfg(target_arch="wasm32")]
#[no_mangle]
pub extern "C" fn destroy_image(img_ptr: *mut RgbImage) {
    println!("Goodbye, {:?}", img_ptr);

    unsafe {
        Box::from_raw(img_ptr);
    }
}


#[cfg(not(target_arch="wasm32"))]
fn save(img: &RgbImage, path: &str) {
    use std::fs::File;
    use std::path::Path;

    let save_start = Instant::now();

    let ref mut fout = File::create(&Path::new(path)).unwrap();

    let enc = image::png::PNGEncoder::new(fout);
    let result = enc.encode(&img, img.width(), img.height(), ColorType::RGB(8));

    match result {
        Ok(_) => print_time_since(save_start, &format!("Saving {}", path)),
        Err(e) => eprintln!("Saving {} failed: {}", path, e)
    };
}

#[cfg(not(target_arch="wasm32"))]
fn main() {
    // TODO command line args

    let (width, height) = (720, 720);
    let ss_scale = 1;

    let mut img = RgbImage::new(width * ss_scale, width * ss_scale);
    //let plot_space = PlotSpace::with_centre(point::ORIGIN, 2.0 * f64::consts::PI, f64::consts::PI);
    let plot_space = PlotSpace::with_centre(Point::new(-2.0/3.0, 0.0), 2.5, 2.5);
    let resolve_point = point_resolver(img.width(), img.height(), plot_space);
    //let paint_point = sin_painter(0.05);
    let paint_point = paint_mandelbrot;

    let total_pixels = img.width() * img.height();

    let plot_start = Instant::now();

    for (n, (x, y, px)) in (1..).zip(img.enumerate_pixels_mut()) {
        let point = resolve_point(x, y);
        *px = paint_point(point);

        if n % (total_pixels / 200).max(1) == 0 {
            use std::io::Write;
            print!("\rPlotting: {:2.1}%", 100.0 * n as f64 / total_pixels as f64);
            std::io::stdout().flush().expect("If we can't flush stdout, we're in trouble");
        }
    }

    println!();

    print_time_since(plot_start, "Plotting");

    let resize_start = Instant::now();

    let resized_img = image::imageops::resize(&img, width, height, image::FilterType::CatmullRom);

    print_time_since(resize_start, "Resizing");

    save(&resized_img, "test.png");
}
