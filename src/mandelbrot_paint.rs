
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
