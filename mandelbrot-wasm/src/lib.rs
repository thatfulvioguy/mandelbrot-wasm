
#![cfg(target_arch="wasm32")]

extern crate mandelbrot;
extern crate image;

use mandelbrot::point::{Point, PlotSpace, point_resolver};
use mandelbrot::mandelbrot_paint::paint_mandelbrot;
use mandelbrot::sin_paint::sin_painter;

use image::RgbImage;

#[no_mangle]
pub extern fn plot_mandelbrot(width: u32, height: u32, ss_scale: u32, centre_x: f64, centre_y: f64, plot_width: f64, plot_height: f64) -> *mut RgbImage {
    let mut img = RgbImage::new(width * ss_scale, width * ss_scale);
    let plot_space = PlotSpace::with_centre(Point::new(centre_x, centre_y), plot_width, plot_height);
    let resolve_point = point_resolver(img.width(), img.height(), plot_space);

    //let paint_point = sin_painter(0.05);
    let paint_point = paint_mandelbrot;

    for (x, y, px) in img.enumerate_pixels_mut() {
        let point = resolve_point(x, y);
        *px = paint_point(point);
    }

    let final_img = if ss_scale > 1 {
        let resized_img = image::imageops::resize(&img, width, height, image::FilterType::Triangle);

        resized_img
    } else {
        img
    };

    Box::into_raw(Box::new(final_img))
}

#[no_mangle]
pub extern fn image_bytes_ptr(img_ptr: *mut RgbImage) -> *mut u8 {
    let img = unsafe { &mut *img_ptr };
    // ImageBuffer gives you the slice by implementing Deref, when it really shouldn't
    // You can get bytes_ptr by just doing img.as_mut_ptr() but it's best to illustrate this weird API design decision
    let img_bytes_slice = &mut (**img);
    let bytes_ptr = img_bytes_slice.as_mut_ptr();

    bytes_ptr
}

#[no_mangle]
pub extern fn destroy_image(img_ptr: *mut RgbImage) {
    unsafe {
        Box::from_raw(img_ptr);
    }
}
