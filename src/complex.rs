
use std::ops::{Add, Mul};

type F = f64;

#[derive(PartialEq, Copy, Clone, Debug)]
pub struct Complex {
    pub re: F,
    pub im: F
}

impl Complex {
    #[inline]
    pub fn new(re: F, im: F) -> Complex {
        Complex { re, im }
    }
}

impl Add for Complex {
    type Output = Self;

    #[inline]
    fn add(self, rhs: Self) -> Self {
        Complex::new(self.re + rhs.re, self.im + rhs.im)
    }
}

impl Mul for Complex {
    type Output = Self;

    #[inline]
    fn mul(self, rhs: Self) -> Self {
        // (x + yi)(u + vi) = (xu - yv) + (xv + yu)i
        let re = self.re * rhs.re - self.im * rhs.im;
        let im = self.re * rhs.im + rhs.re * self.im;

        Complex { re, im }
    }
}
