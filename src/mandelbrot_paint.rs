
use colour::BLACK;
use point::Point;

use image::Rgb;
use complex::Complex;

const MAX_ITERS: u32 = 512;

use image::Luma;
use image::Pixel;
use std::u8;

enum MandelbrotResult {
    ProbablyInSet,
    NotInSet(u32)
}

fn assess_mandelbrot_membership(c: Complex) -> MandelbrotResult {
    let mut z = c;

    for iteration in 0..MAX_ITERS {
        // TODO further research on this part
        if (z.re * z.re) + (z.im * z.im) > 4.0 { // If |z| > 2, but without expensive sqrt
            return MandelbrotResult::NotInSet(iteration);
        }

        z = (z * z) + c;
    }

    return MandelbrotResult::ProbablyInSet;
}

pub fn paint_mandelbrot(p: Point) -> Rgb<u8> {
    match assess_mandelbrot_membership(Complex::new(p.x, p.y)) {
        MandelbrotResult::ProbablyInSet => BLACK,
        MandelbrotResult::NotInSet(iterations) => {
            Luma::<u8>([u8::MAX - (iterations * u8::MAX as u32 / MAX_ITERS) as u8]).to_rgb()
        }
    }
}
