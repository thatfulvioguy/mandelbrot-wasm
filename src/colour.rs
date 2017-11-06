
use point::Point;

use image::{Pixel, Rgb};

pub type PointPainter = Fn(Point) -> Rgb<u8>;

pub const BLACK: Rgb<u8> = Rgb { data: [0x00, 0x00, 0x00] };
pub const WHITE: Rgb<u8> = Rgb { data: [0xff, 0xff, 0xff] };

pub trait AsHex where Self: Pixel {
    fn as_hex(&self) -> String;
}

impl AsHex for Rgb<u8> {
    fn as_hex(&self) -> String {
        let channels = self.channels();
        format!("#{:02x}{:02x}{:02x}", channels[0], channels[1], channels[2])
    }
}