import React, { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Cleave from 'cleave.js/react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useI18n } from '../i18n/I18nContext';

export interface CardFormData {
  name: string;
  cpf: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  flag: string;
}

interface Props {
  onClose: () => void;
}

const CreditCardForm = forwardRef(({ onClose }: Props, ref) => {
  const { t } = useI18n();

  const schema = yup.object().shape({
    name: yup.string().required(t('plansPage.validation.name')),
    cpf: yup
      .string()
      .required(t('plansPage.validation.cpfRequired'))
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, t('plansPage.validation.cpfInvalid')),
    cardNumber: yup
      .string()
      .required(t('plansPage.validation.cardRequired'))
      .matches(/^\d{4} \d{4} \d{4} \d{4}$/, t('plansPage.validation.cardInvalid')),
    expiry: yup
      .string()
      .required(t('plansPage.validation.expiryRequired'))
      .matches(/^\d{2}\/\d{2}$/, t('plansPage.validation.expiryInvalid')),
    cvv: yup
      .string()
      .required(t('plansPage.validation.cvvRequired'))
      .matches(/^\d{3,4}$/, t('plansPage.validation.cvvInvalid')),
    flag: yup.string().required(t('plansPage.validation.flag')),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CardFormData>({
    resolver: yupResolver(schema),
  });

  useImperativeHandle(ref, () => ({
    submit: () =>
      handleSubmit(data => {
        console.log('📦 Dados do cartão:', data);
        reset();
        onClose();
      })(),
  }));

  return (
    <form className="space-y-4 text-white">
      <div>
        <label className="block text-sm mb-1">{t('plansPage.form.name')}</label>
        <input
          {...register('name')}
          className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
        />
        {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">{t('plansPage.form.cpf')}</label>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <Cleave
              {...field}
              options={{
                delimiters: ['.', '.', '-'],
                blocks: [3, 3, 3, 2],
                numericOnly: true,
              }}
              className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
            />
          )}
        />
        {errors.cpf && <p className="text-red-400 text-sm">{errors.cpf.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">{t('plansPage.form.cardNumber')}</label>
        <Controller
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <Cleave
              {...field}
              options={{ creditCard: true }}
              className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
            />
          )}
        />
        {errors.cardNumber && <p className="text-red-400 text-sm">{errors.cardNumber.message}</p>}
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm mb-1">{t('plansPage.form.expiry')}</label>
          <Controller
            name="expiry"
            control={control}
            render={({ field }) => (
              <Cleave
                {...field}
                options={{
                  date: true,
                  datePattern: ['m', 'y'],
                }}
                placeholder="MM/AA"
                className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
              />
            )}
          />
          {errors.expiry && <p className="text-red-400 text-sm">{errors.expiry.message}</p>}
        </div>

        <div className="w-1/2">
          <label className="block text-sm mb-1">{t('plansPage.form.cvv')}</label>
          <input
            {...register('cvv')}
            maxLength={4}
            className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
          />
          {errors.cvv && <p className="text-red-400 text-sm">{errors.cvv.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">{t('plansPage.form.flag')}</label>
        <select
          {...register('flag')}
          className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
        >
          <option value="visa">Visa</option>
          <option value="mastercard">Mastercard</option>
          <option value="elo">Elo</option>
          <option value="amex">Amex</option>
        </select>
        {errors.flag && <p className="text-red-400 text-sm">{errors.flag.message}</p>}
      </div>
    </form>
  );
});

export default CreditCardForm;
