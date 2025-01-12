import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-14 py-24 sm:p-20 md:p-32 gap-14">
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="flex flex-row items-center gap-2">
          <Image
            src="/logo.svg"
            width={300}
            height={225}
            alt="BirthdayBot"
            className="w-[120px] sm:w-[200px] md:w-[300px]"
          />
          <span className="text-neutral--9 font-display text-xl sm:text-3xl md:text-4xl">
            Welcome to Birthday Bot
          </span>
        </div>
        <div className="flex flex-col text-neutral--9 font-text text-md sm:text-xl md:text-2xl w-[100%] md:w-[50%] gap-8 text-center">
          <span>Never miss a birthday message again!</span>
          <span>
            Set a reminder and get notified with a quick contact button for easy
            messaging, all inside WhatsApp.
          </span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open("https://wa.me/15556285236", "_blank")}
      >
        <Image
          src="/WhatsAppButtonWhiteLarge.svg"
          width={207}
          height={48}
          alt="BirthdayBot"
          className="w-[160px] sm:w-[200px] md:w-[200px]"
        />
      </motion.button>
    </main>
  );
}
