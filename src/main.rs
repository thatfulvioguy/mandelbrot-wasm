
extern crate image;
extern crate num;
extern crate chrono;

mod point;
mod sin_paint;
mod mandelbrot_paint;
mod colour;

use point::{Point, PlotSpace, point_resolver};
use mandelbrot_paint::paint_mandelbrot;
use sin_paint::sin_painter;

use std::f64;
use std::fs::File;
use std::path::Path;
use std::time::Instant;

use image::{RgbImage, ColorType};

fn save(img: &RgbImage, path: &str) {
    let save_start = Instant::now();

    let ref mut fout = File::create(&Path::new(path)).unwrap();

    let enc = image::png::PNGEncoder::new(fout);
    let result = enc.encode(&img, img.width(), img.height(), ColorType::RGB(8));

    match result {
        Ok(_) => print_time_since(save_start, &format!("Saving {}", path)),
        Err(e) => eprintln!("Saving {} failed: {}", path, e)
    };
}

fn print_time_since(start: Instant, desc: &str) {
    let duration = chrono::Duration::from_std(start.elapsed()).ok();
    let duration_micros = duration.and_then(|duration| duration.num_microseconds());
    if let Some(micros) = duration_micros {
        println!("{} took {:.2}ms", desc, micros as f64 / 1000.0)
    } else {
        println!("{} took too long, somehow", desc)
    }
}

fn main() {
    let (width, height) = (480, 480);
    let ss_scale = 2;

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