
use colour::{BLACK, WHITE};
use point::Point;

use image::Rgb;
use complex::Complex;

fn is_mandelbrot(c: Complex) -> bool {
    let mut z = c;

    for _iteration in 0..500 {
        // TODO further research on this part
        if (z.re * z.re) + (z.im * z.im) > 4.0 { // If |z| > 2, but without expensive sqrt
            return false;
        }

        z = (z * z) + c;
    }

    return true;
}

pub fn paint_mandelbrot(p: Point) -> Rgb<u8> {
    if is_mandelbrot(Complex::new(p.x, p.y)) {
        BLACK
    } else {
        WHITE
    }
}

pub fn paint_mandelbrot2(p: Point) -> u32 {
    if is_mandelbrot(Complex::new(p.x, p.y)) {
        (0x00 << 16) | (0x00 << 8) | (0x00)
    } else {
        (0xff << 16) | (0xff << 8) | (0xff)
    }
}