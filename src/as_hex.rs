
use image::{Pixel, Rgb};

pub trait AsHex where Self: Pixel {
    fn as_hex(&self) -> String;
}

impl AsHex for Rgb<u8> {
    fn as_hex(&self) -> String {
        let channels = self.channels();
        format!("#{:02x}{:02x}{:02x}", channels[0], channels[1], channels[2])
    }
}