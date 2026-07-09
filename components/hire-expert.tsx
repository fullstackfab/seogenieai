"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { ContactForm } from "@/components/forms/contact-form";

/**
 * Floating "Connect with the Best" button opening the contact form in a modal.
 * (The legacy version rendered the entire contact-us page inside a custom
 * overlay; this reuses the shared ContactForm + Modal instead.)
 */
export function HireExpert() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          aria-label="Contact an expert"
          className="cursor-pointer py-3 px-5 bg-white/80 backdrop-blur-lg rounded-xl shadow-6xl text-dark-100 flex justify-center gap-x-4 items-center text-xl font-semibold tracking-tight"
        >
          <Image src="/images/expert.png" width={50} height={50} alt="" />
          Connect with the Best
        </button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} contentLabel="Contact an expert">
        <ContactForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
