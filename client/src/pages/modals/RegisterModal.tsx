import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useI18n } from "../../i18n/I18nContext";
import Modal from "../../components/Modal";
import Select from "../../components/Select";

interface RegisterModalProps {
  onClose: () => void;
}

const countries = [
  { value: "br", label: "Brasil" },
  { value: "us", label: "United States" },
  { value: "es", label: "España" },
  { value: "pt", label: "Portugal" },
  { value: "mx", label: "México" },
];

const genders = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outros" },
];

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const { t } = useI18n();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: "",
      country: "br",
      gender: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required(t("register.validation.firstName")),
      lastName: Yup.string().required(t("register.validation.lastName")),
      email: Yup.string()
        .email(t("register.validation.emailInvalid"))
        .required(t("register.validation.emailRequired")),
      birthDate: Yup.string().required(t("register.validation.birthDate")),
      country: Yup.string().required(t("register.validation.country")),
      gender: Yup.string().required(t("register.validation.gender")),
    }),
    onSubmit: (values) => {
      localStorage.setItem("serena_user_profile", JSON.stringify(values));
      console.log("User info:", values);
      onClose();
    },
  });

  return (
    <Modal
      title={t("register.title")}
      description={
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-white">
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-sm mb-1 block">
                {t("register.firstName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                onChange={formik.handleChange}
                value={formik.values.firstName}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-red-400 text-xs mt-1">
                  {formik.errors.firstName}
                </div>
              )}
            </div>

            <div className="w-1/2">
              <label className="text-sm mb-1 block">
                {t("register.lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                onChange={formik.handleChange}
                value={formik.values.lastName}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-red-400 text-xs mt-1">
                  {formik.errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm mb-1 block">
              {t("register.email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-400 text-xs mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm mb-1 block">
              {t("register.birthDate")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="birthDate"
              onChange={formik.handleChange}
              value={formik.values.birthDate}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
            {formik.touched.birthDate && formik.errors.birthDate && (
              <div className="text-red-400 text-xs mt-1">
                {formik.errors.birthDate}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm mb-1 block">
              {t("register.country")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.country}
              onChange={(val) => formik.setFieldValue("country", val)}
              options={countries}
            />
            {formik.touched.country && formik.errors.country && (
              <div className="text-red-400 text-xs mt-1">
                {formik.errors.country}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm mb-1 block">
              {t("register.gender")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.gender}
              onChange={(val) => formik.setFieldValue("gender", val)}
              options={genders}
            />
            {formik.touched.gender && formik.errors.gender && (
              <div className="text-red-400 text-xs mt-1">
                {formik.errors.gender}
              </div>
            )}
          </div>
        </form>
      }
      onCancel={onClose}
      onConfirm={formik.submitForm}
      cancelText={t("register.cancel")}
      confirmText={t("register.submit")}
      size="md"
    />
  );
};

export default RegisterModal;
