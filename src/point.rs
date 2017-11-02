
use std::ops;

#[derive(Copy, Clone)]
pub struct Point {
    pub x: f64,
    pub y: f64
}

impl ops::Add for Point {
    type Output = Point;

    fn add(self, other: Self) -> Self {
        Point {
            x: self.x + other.x,
            y: self.y + other.y
        }
    }
}

impl ops::Sub for Point {
    type Output = Point;

    fn sub(self, other: Self) -> Self {
        Point {
            x: self.x - other.x,
            y: self.y - other.y
        }
    }
}

const ORIGIN: Point = Point { x: 0.0, y: 0.0 };
