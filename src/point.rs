
use std::ops;

#[derive(Copy, Clone)]
pub struct Point {
    pub x: f64,
    pub y: f64
}

impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
}

impl ops::Add for Point {
    type Output = Point;

    fn add(self, other: Self) -> Self {
        Point::new(self.x + other.x, self.y + other.y)
    }
}

impl ops::Sub for Point {
    type Output = Point;

    fn sub(self, other: Self) -> Self {
        Point::new(self.x - other.x, self.y - other.y)
    }
}

pub const ORIGIN: Point = Point { x: 0.0, y: 0.0 };

#[derive(Copy, Clone)]
pub struct PlotSpace {
    pub origin: Point,
    pub width: f64,
    pub height: f64
}

impl PlotSpace {
    pub fn with_centre(centre: Point, width: f64, height: f64) -> PlotSpace {
        PlotSpace {
            origin: Point {
                x: centre.x - (width / 2.0),
                y: centre.y - (height / 2.0)
            },
            width,
            height
        }
    }
}

/// Returns a function which resolves an image pixel coordinate to a point on a bounded cartesian plane
pub fn point_resolver(img_width: u32, img_height: u32, plot_space: PlotSpace) -> Box<Fn(u32, u32) -> Point> {
    Box::new(move |img_x: u32, img_y: u32| {
        Point {
            x: plot_space.origin.x + (plot_space.width * img_x as f64 / (img_width as f64)),
            y: plot_space.origin.y + plot_space.height - (plot_space.height * img_y as f64 / (img_height as f64))
        }
    })
}
