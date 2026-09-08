import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

import Form from "@/presentation/ui/Form";
import Loader from "@/presentation/layout/Loader";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useDepositBankAccounts } from "@/adapters/hooks/actions/useDepositBankAccounts";
import { useCreateDeposit } from "@/adapters/hooks/actions/useCreateDeposit";
import type { BankAccountRow } from "@/api/clients/wallet.api";

import DepositBankAccountPicker from "./DepositBankAccountPicker";
import DepositPayToDetails from "./DepositPayToDetails";
import DepositResult from "./DepositResult";
import { depositFields } from "./depositFields";
import { depositSchema } from "./depositSchema";

type Step = 1 | 2 | 3;

const STEP_TITLES: Record<Step, string> = {
  1: "Elige la cuenta",
  2: "Datos para el pago",
  3: "Registra tu comprobante",
};

const DepositPage: FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { accounts, loading: accountsLoading, error: accountsError } =
    useDepositBankAccounts();
  const { submit, submitting, error, fieldErrors, result, reset, onCooldown } =
    useCreateDeposit();

  const [step, setStep] = useState<Step>(1);
  const [account, setAccount] = useState<BankAccountRow | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  const handleBack = () => {
    if (step === 1) return navigate("/wallet");
    if (step === 2) return setStep(1);
    return setStep(2);
  };

  const handleSelectAccount = (acc: BankAccountRow) => {
    setAccount(acc);
    setStep(2);
  };

  const handleSubmit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    if (!account) return;
    setFileError(null);
    const file = data.receipt_image;
    if (!(file instanceof File)) {
      setFileError("Adjunta la captura del comprobante.");
      return;
    }
    await submit({
      bankAccountId: account.bank_account_id,
      referenceNumber: String(data.reference_number ?? "").trim(),
      amountBs: String(data.amount_bs ?? "").replace(",", "."),
      receiptImage: file,
    });
  };

  const mergedFieldErrors = {
    ...fieldErrors,
    ...(fileError ? { receipt_image: fileError } : {}),
  };

  return (
    <main className="flex-1 flex items-start justify-center px-6 py-10">
      <Loader visible={submitting} />
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {!result && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Volver"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                         hover:bg-gray-50 transition-colors shrink-0 bg-white cursor-pointer"
            >
              <LuArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-primary font-bold text-xl">Depositar</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {result
                ? "Resultado"
                : `Paso ${step} de 3 · ${STEP_TITLES[step]}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
          {result ? (
            <DepositResult
              status={result.status}
              onGoWallet={() => navigate("/wallet")}
              onGoHome={() => navigate("/")}
            />
          ) : step === 1 ? (
            <DepositBankAccountPicker
              accounts={accounts}
              loading={accountsLoading}
              error={accountsError}
              onSelect={handleSelectAccount}
            />
          ) : step === 2 && account ? (
            <DepositPayToDetails
              account={account}
              onBack={() => setStep(1)}
              onContinue={() => {
                reset();
                setStep(3);
              }}
            />
          ) : (
            <>
              {error && (
                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
              )}
              {onCooldown && !error && (
                <p className="text-sm text-amber-600 mb-4 text-center">
                  Espera unos segundos antes de reintentar.
                </p>
              )}
              <Form
                fields={depositFields}
                schema={depositSchema}
                submitLabel="Enviar comprobante"
                onSubmit={handleSubmit}
                isLoading={submitting || onCooldown}
                backendErrors={mergedFieldErrors}
                singleColumn
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default DepositPage;
