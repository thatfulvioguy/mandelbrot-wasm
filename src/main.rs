
extern crate image;

mod point;

use point::Point;

use image::{Pixel, Rgb, RgbImage, ColorType};
use std::f64;
use std::fs::File;
use std::path::Path;

trait AsHex where Self: Pixel {
    fn as_hex(&self) -> String;
}

impl AsHex for Rgb<u8> {
    fn as_hex(&self) -> String {
        let channels = self.channels();
        format!("#{:02x}{:02x}{:02x}", channels[0], channels[1], channels[2])
    }
}

fn save(img: &RgbImage, path: &str) {
    let ref mut fout = File::create(&Path::new(path)).unwrap();

    let enc = image::png::PNGEncoder::new(fout);
    let result = enc.encode(&img, img.width(), img.height(), ColorType::RGB(8));
    result.unwrap();
}

struct PlotSpace {
    origin: Point,
    width: f64,
    height: f64
}

fn coord_resolver(img_width: u32, img_height: u32, plot_space: PlotSpace) -> Box<Fn(u32, u32) -> Point> {
    Box::new(move|img_x: u32, img_y: u32| {
        Point {
            x: (plot_space.width * img_x as f64 / (img_width as f64)) + plot_space.origin.x,
            y: (plot_space.height * img_y as f64 / (img_height as f64)) + plot_space.origin.y
        }
    })
}

fn is_vaguely_sin(p: Point) -> bool {
    let sin_x = f64::sin(p.x);
    p.y >= (sin_x - 0.05) && p.y <= (sin_x + 0.05)
}

fn main() {
    println!("Hello, world!");

    let mut img = RgbImage::new(800, 400);

    let plot_space = PlotSpace {
        origin: Point { x: 0.0, y: -f64::consts::FRAC_PI_2 },
        width: 2.0 * f64::consts::PI,
        height: f64::consts::PI
    };
    let resolve_coord = coord_resolver(img.width(), img.height(), plot_space);

    for (x, y, px) in img.enumerate_pixels_mut() {
        {
            let channels = px.channels_mut();

            if is_vaguely_sin(resolve_coord(x, y)) {
                channels[0] = 0x00;
                channels[1] = 0x00;
                channels[2] = 0x00;
            } else {
                channels[0] = 0xff;
                channels[1] = 0xff;
                channels[2] = 0xff;
            }
        }

        //println!("{} {} {}", x, y, px.as_hex());
    }

    save(&img, "test.png");
}