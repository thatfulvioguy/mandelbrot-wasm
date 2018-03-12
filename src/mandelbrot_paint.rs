
use colour::{BLACK, WHITE};
use point::Point;

use image::Rgb;
use num::complex::Complex64;

fn is_mandelbrot(c: Complex64) -> bool {
    let mut z = c;

    for _iteration in 0..500 {
        // TODO further research on this part
        if (z.re * z.re) + (z.im * z.im) > 4.0 {
            return false;
        }

        z = (z * z) + c;
    }

    return true;
}

pub fn paint_mandelbrot(p: Point) -> Rgb<u8> {
    if is_mandelbrot(Complex64::new(p.x, p.y)) {
        BLACK
    } else {
        WHITE
    }
}

pub fn paint_mandelbrot2(p: Point) -> u32 {
    if is_mandelbrot(Complex64::new(p.x, p.y)) {
        (0x00 << 16) | (0x00 << 8) | (0x00)
    } else {
        (0xff << 16) | (0xff << 8) | (0xff)
    }
}