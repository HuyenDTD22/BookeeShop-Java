import React from "react";
import LoginPageAdmin from "../pages/admin/auth/LoginPageAdmin";
import DashboardPage from "../pages/admin/dashboard/DashboardPage";
import BookListPage from "../pages/admin/book/BookListPage";
import BookDetailPage from "../pages/admin/book/BookDetailPage";
import BookFormPage from "../pages/admin/book/BookFormPage";
import CategoryListPage from "../pages/admin/category/CategoryListPage";
import CategoryDetailPage from "../pages/admin/category/CategoryDetailPage";
import CategoryFormPage from "../pages/admin/category/CategoryFormPage";
import CustomerListPage from "../pages/admin/customer/CustomerListPage";
import CustomerDetailPage from "../pages/admin/customer/CustomerDetailPage";
import StaffListPage from "../pages/admin/staff/StaffListPage";
import StaffDetailPage from "../pages/admin/staff/StaffDetailPage";
import StaffFormPage from "../pages/admin/staff/StaffFormPage";
import RoleListPage from "../pages/admin/role/RoleListPage";
import RoleFormPage from "../pages/admin/role/RoleFormPage";
import PermissionsPage from "../pages/admin/permission/PermissionsPage";
import OrderListPage from "../pages/admin/order/OrderListPage";
import OrderDetailPage from "../pages/admin/order/OrderDetailPage";
import OrderEditPage from "../pages/admin/order/OrderEditPage";
import NotificationListPage from "../pages/admin/notification/NotificationListPage";
import NotificationDetailPage from "../pages/admin/notification/NotificationDetailPage";
import NotificationCreatePage from "../pages/admin/notification/NotificationCreatePage";
import NotificationEditPage from "../pages/admin/notification/NotificationEditPage";
import MyAccountPage from "../pages/admin/account/MyAccountPage";
import MyAccountEditPage from "../pages/admin/account/MyAccountEditPage";
import MyNotificationsPage from "../pages/admin/account/MyNotificationsPage";
import MyNotificationDetailPage from "../pages/admin/account/MyNotificationDetailPage";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const CreateBookPage = () => <BookFormPage mode="create" />;
const EditBookPage = () => <BookFormPage mode="edit" />;
const CreateCategoryPage = () => <CategoryFormPage mode="create" />;
const EditCategoryPage = () => <CategoryFormPage mode="edit" />;
const CreateStaffPage = () => <StaffFormPage mode="create" />;
const EditStaffPage = () => <StaffFormPage mode="edit" />;
const CreateRolePage = () => <RoleFormPage mode="create" />;
const EditRolePage = () => <RoleFormPage mode="edit" />;

export const adminRoutes = [
  /* ── Auth ── */
  { path: `/${ADMIN}/auth/login`, page: LoginPageAdmin, isAdmin: false },

  /* ── Dashboard ── */
  { path: `/${ADMIN}/`, page: DashboardPage, isAdmin: true },
  { path: `/${ADMIN}`, page: DashboardPage, isAdmin: true },

  /* ── Books ── */
  { path: `/${ADMIN}/book`, page: BookListPage, isAdmin: true },
  { path: `/${ADMIN}/book/create`, page: CreateBookPage, isAdmin: true },
  { path: `/${ADMIN}/book/detail/:id`, page: BookDetailPage, isAdmin: true },
  { path: `/${ADMIN}/book/edit/:id`, page: EditBookPage, isAdmin: true },

  /* ── Categories ── */
  { path: `/${ADMIN}/category`, page: CategoryListPage, isAdmin: true },
  {
    path: `/${ADMIN}/category/create`,
    page: CreateCategoryPage,
    isAdmin: true,
  },
  {
    path: `/${ADMIN}/category/detail/:id`,
    page: CategoryDetailPage,
    isAdmin: true,
  },
  {
    path: `/${ADMIN}/category/edit/:id`,
    page: EditCategoryPage,
    isAdmin: true,
  },

  /* ── Customers ── */
  { path: `/${ADMIN}/customer`, page: CustomerListPage, isAdmin: true },
  {
    path: `/${ADMIN}/customer/detail/:id`,
    page: CustomerDetailPage,
    isAdmin: true,
  },

  /* ── Staff ── */
  { path: `/${ADMIN}/staff`, page: StaffListPage, isAdmin: true },
  { path: `/${ADMIN}/staff/create`, page: CreateStaffPage, isAdmin: true },
  { path: `/${ADMIN}/staff/detail/:id`, page: StaffDetailPage, isAdmin: true },
  { path: `/${ADMIN}/staff/edit/:id`, page: EditStaffPage, isAdmin: true },

  /* ── Roles ── */
  { path: `/${ADMIN}/role`, page: RoleListPage, isAdmin: true },
  { path: `/${ADMIN}/role/create`, page: CreateRolePage, isAdmin: true },
  { path: `/${ADMIN}/role/edit/:id`, page: EditRolePage, isAdmin: true },

  /* ── Permissions ── */
  { path: `/${ADMIN}/role/permissions`, page: PermissionsPage, isAdmin: true },

  /* ── Orders ── */
  { path: `/${ADMIN}/order`, page: OrderListPage, isAdmin: true },
  { path: `/${ADMIN}/order/detail/:id`, page: OrderDetailPage, isAdmin: true },
  { path: `/${ADMIN}/order/edit/:id`, page: OrderEditPage, isAdmin: true },

  /* ── Notifications ── */
  { path: `/${ADMIN}/notification`, page: NotificationListPage, isAdmin: true },
  {
    path: `/${ADMIN}/notification/create`,
    page: NotificationCreatePage,
    isAdmin: true,
  },
  {
    path: `/${ADMIN}/notification/detail/:id`,
    page: NotificationDetailPage,
    isAdmin: true,
  },
  {
    path: `/${ADMIN}/notification/edit/:id`,
    page: NotificationEditPage,
    isAdmin: true,
  },

  /* ── My Account ── */
  { path: `/${ADMIN}/my-account`, page: MyAccountPage, isAdmin: true },
  { path: `/${ADMIN}/my-account/edit`, page: MyAccountEditPage, isAdmin: true },
  {
    path: `/${ADMIN}/my-notifications`,
    page: MyNotificationsPage,
    isAdmin: true,
  },
  {
    path: `/${ADMIN}/my-notifications/:id`,
    page: MyNotificationDetailPage,
    isAdmin: true,
  },
];
