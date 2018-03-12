
extern crate mandelbrot;
extern crate image;

use mandelbrot::point::{Point, PlotSpace, point_resolver};
use mandelbrot::mandelbrot_paint::paint_mandelbrot;
use mandelbrot::sin_paint::sin_painter;

use std::f64;
use std::time::Instant;

use image::{RgbImage, ColorType};

fn print_time_since(start: Instant, desc: &str) {
    let elapsed = start.elapsed();
    let elapsed_micros = (elapsed.as_secs() * 1_000_000) as f64 + (elapsed.subsec_nanos() / 1000) as f64;
    println!("{} took {:.2}ms", desc, elapsed_micros / 1000.0)
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

#[cfg(target_arch="wasm32")]
fn main() {

}
