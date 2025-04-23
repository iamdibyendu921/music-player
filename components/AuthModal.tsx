import { useSupabaseClient } from "@supabase/auth-helpers-react";
// import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useCallback, useEffect, useState } from "react";
import useAuthModal from "@/hooks/useAuthModal";
import { IoMdClose } from "react-icons/io";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const { onClose, isOpen } = useAuthModal();
  const [isAuthEventHandled, setIsAuthEventHandled] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event) => {
      if (!isAuthEventHandled && (event === "SIGNED_IN" || event === "SIGNED_OUT")) {
        setIsAuthEventHandled(true);
        onClose(); 
        setTimeout(() => {
          window.location.reload(); 
        }, 500); 
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, onClose, isAuthEventHandled]);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-neutral-900/90 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative bg-neutral-800 border border-neutral-700 rounded-md p-6 w-full max-w-md shadow-lg z-50">
        <button className="absolute top-3 right-3 text-neutral-400 hover:text-white" onClick={closeModal}>
          <IoMdClose size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-sm text-center mb-4">Login to your account</p>

        <Auth
          theme="dark"
          magicLink
          providers={["google"]}
          supabaseClient={supabaseClient}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#404040",
                  brandAccent: "#22c55e",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthModal;

