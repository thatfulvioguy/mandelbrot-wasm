
extern crate image;
extern crate chrono;

mod point;
mod sin_paint;
mod as_hex;

use point::{Point, PlotSpace, point_resolver};
use sin_paint::sin_painter;

use std::f64;
use std::fs::File;
use std::path::Path;
use std::time::{Instant};

use image::{Rgb, RgbImage, ColorType};

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

type PointPainter = Fn(Point) -> Rgb<u8>;

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
    let mut img = RgbImage::new(800, 400);

    let plot_space = PlotSpace {
        origin: Point { x: 0.0, y: -f64::consts::FRAC_PI_2 },
        width: 2.0 * f64::consts::PI,
        height: f64::consts::PI
    };
    let resolve_point = point_resolver(img.width(), img.height(), plot_space);
    let paint_point = sin_painter(0.05);

    let plot_start = Instant::now();

    for (x, y, px) in img.enumerate_pixels_mut() {
        let point = resolve_point(x, y);
        *px = paint_point(point);
    }

    print_time_since(plot_start, "Plotting");

    save(&img, "test.png");
}