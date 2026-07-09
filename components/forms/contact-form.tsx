"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useToast } from "@/providers/toast-provider";

const INPUT_CLASS =
  "max-md-mobile:p-6 p-4 pr-[60px] placeholder:opacity-80 focus:border-dark-100 border-2 border-black/30 placeholder:text-black w-full bg-transparent rounded-[10px] text-base font-normal text-black leading-[15.96px] tracking-[0.02em]";

const SUBJECT_OPTIONS = [
  "SEO EXPERT",
  "Digital Marketing Expert",
  "WEB Developer",
  "IOS/Android Developer",
];

const EMPTY = { name: "", email: "", message: "", subject: "", url: "", phone: "" };

/** Shared contact form: used by /contact-us and the Hire-an-Expert modal. */
export function ContactForm({ onSuccess }: { onSuccess?: () => void }) {
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: formData.subject,
          url: formData.url,
          ...(formData.phone ? { phoneNumber: Number(formData.phone) } : {}),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormData(EMPTY);
      showSuccess("Email sent successfully");
      onSuccess?.();
    } catch {
      showError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto mt-16 mb-16">
      <h1 className="text-4xl text-center mb-8 font-semibold tracking-normal">Contact Us</h1>
      <div className="md:flex items-center gap-8">
        <div className="md:w-[50%]">
          <label htmlFor="contact-name" className="mb-3 block">
            Enter your Name*
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Name"
            value={formData.name}
            required
            className={INPUT_CLASS}
            name="name"
            onChange={handleChange}
          />
        </div>
        <div className="md:w-[50%]">
          <label htmlFor="contact-email" className="mb-3 mt-5 md:mt-0 block">
            Enter your Email*
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="Email"
            value={formData.email}
            required
            className={INPUT_CLASS}
            name="email"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="md:flex items-center gap-8">
        <div className="md:w-[50%]">
          <label htmlFor="contact-url" className="mb-3 mt-5 block">
            Enter your website URL*
          </label>
          <input
            id="contact-url"
            type="text"
            placeholder="www.example.com"
            value={formData.url}
            required
            className={INPUT_CLASS}
            name="url"
            onChange={handleChange}
          />
        </div>
        <div className="md:w-[50%]">
          <label htmlFor="contact-phone" className="mb-3 mt-5 block">
            Enter your Phone Number
          </label>
          <input
            id="contact-phone"
            type="number"
            placeholder="Contact Number"
            value={formData.phone}
            className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${INPUT_CLASS}`}
            name="phone"
            onChange={handleChange}
          />
        </div>
      </div>
      <label htmlFor="contact-subject" className="mb-3 mt-5 block">
        Choose Expertise for Assistance*
      </label>
      <select
        id="contact-subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        required
        className={INPUT_CLASS}
      >
        <option value="" disabled>
          Select option
        </option>
        {SUBJECT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor="contact-message" className="mb-3 mt-5 block">
        Tell us more
      </label>
      <textarea
        id="contact-message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Tell us more..."
        className={`h-[150px] ${INPUT_CLASS}`}
      />
      <button
        type="submit"
        disabled={loading}
        className="disabled:cursor-not-allowed disabled:opacity-50 max-md-mobile:p-6 p-4 w-full mt-6 text-center block text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-dark-100"
      >
        {loading ? "Submitting" : "Submit"}
      </button>
    </form>
  );
}
