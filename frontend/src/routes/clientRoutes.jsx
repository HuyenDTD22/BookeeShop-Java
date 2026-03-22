import React from "react";
import LoginPage from "../pages/client/auth/LoginPage";
import RegisterPage from "../pages/client/auth/RegisterPage";
import ForgotPasswordPage from "../pages/client/auth/ForgotPasswordPage";
import VerifyOtpPage from "../pages/client/auth/VerifyOtpPage";
import HomePage from "../pages/client/home/HomePage";
import BookDetailPage from "../pages/client/book/BookDetailPage";
import BookListPage from "../pages/client/book/BookListPage";
import FeaturedBooksPage from "../pages/client/book/FeaturedBooksPage";
import NewestBooksPage from "../pages/client/book/NewestBooksPage";
import CategoryBooksPage from "../pages/client/book/CategoryBooksPage";
import CartPage from "../pages/client/cart/CartPage";
import CheckoutPage from "../pages/client/checkout/CheckoutPage";
import OrdersPage from "../pages/client/order/OrdersPage";
import NotificationsPage from "../pages/client/notification/NotificationsPage";
import ProfilePage from "../pages/client/profile/ProfilePage";

export const clientAuthRoutes = [
  { path: "/auth/login", page: LoginPage },
  { path: "/auth/register", page: RegisterPage },
  { path: "/auth/forgot-password", page: ForgotPasswordPage },
  { path: "/auth/verify-otp", page: VerifyOtpPage },
];

export const clientRoutes = [
  { path: "/", page: HomePage, layout: true },
  { path: "/books", page: BookListPage, layout: true },
  { path: "/books/featured", page: FeaturedBooksPage, layout: true },
  { path: "/books/newest", page: NewestBooksPage, layout: true },
  {
    path: "/books/category/:categoryId",
    page: CategoryBooksPage,
    layout: true,
  },
  { path: "/books/:bookId", page: BookDetailPage, layout: true },
  { path: "/cart", page: CartPage, layout: true },
  { path: "/checkout", page: CheckoutPage, layout: true },
  { path: "/orders", page: OrdersPage, layout: true },
  { path: "/notifications", page: NotificationsPage, layout: true },
  { path: "/profile", page: ProfilePage, layout: true },
];
