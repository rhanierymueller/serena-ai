// src/pages/modals/LoginModal.tsx
import React, { useState } from "react";
import Modal from "../../components/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser } from "../../services/userService";
import { saveUser } from "../../services/userSession";
import { useI18n } from "../../i18n/I18nContext";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useI18n();
  const [isHuman, setIsHuman] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("E-mail inválido").required("Obrigatório"),
      password: Yup.string().required("Senha obrigatória"),
    }),
    onSubmit: async (values) => {
      try {
        if (!isHuman) return alert("Confirme que você não é um robô.");

        const user = await loginUser(values);
        saveUser(user);
        onSuccess();
      } catch (err) {
        alert("Erro ao autenticar.");
        console.error(err);
      }
    },
  });

  return (
    <Modal
      title={t("login.title")}
      description={
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-white">
          <div>
            <label className="text-sm mb-1 block">{t("login.email")}</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">{t("login.password")}</label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
          </div>
          <div className="text-sm mt-4">
            <label>
              <input
                type="checkbox"
                onChange={(e) => setIsHuman(e.target.checked)}
                className="mr-2"
              />
              {t("login.notARobot")}
            </label>
          </div>
        </form>
      }
      onCancel={onClose}
      onConfirm={formik.submitForm}
      confirmText={t("login.confirm")}
      cancelText={t("register.cancel")}
      size="sm"
    />
  );
};

export default LoginModal;
