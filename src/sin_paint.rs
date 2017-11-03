
use super::PointPainter;
use point::Point;

use image::Rgb;

const BLACK: Rgb<u8> = Rgb { data: [0x00, 0x00, 0x00] };
const WHITE: Rgb<u8> = Rgb { data: [0xff, 0xff, 0xff] };

pub fn sin_painter(margin: f64) -> Box<PointPainter> {
    Box::new(move |p: Point| {
        let sin_x = f64::sin(p.x);
        let is_vaguely_sin = p.y >= (sin_x - margin) && p.y <= (sin_x + margin);

        if is_vaguely_sin {
            BLACK
        } else {
            WHITE
        }
    })
}
