import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PiHandPalm } from "react-icons/pi";
import { FaDiamond } from "react-icons/fa6";
import {Button as BaseButton} from "@/components/ui/button";

const documentList = [
  "NID",
  "Trade License",
  "TIN Certificate",
  "Civil Aviation Certificate",
];

const RegisterAlertModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[94%] max-h-[90vh] overflow-y-auto !bg-[#3C4949] !rounded-2xl !border-none !p-6">
        <div>
          <h2 className="flex items-center gap-2 text_highlight-alpha font-semibold">
            <PiHandPalm className="bg-dark-sun-yellow-alpha text_highlight-alpha-black size-7 p-1.5 rounded-full" />
            <span>More one steps to go</span>
          </h2>
          <div className="text_highlight-beta text-sm leading-relaxed mb-2 mt-2">
            Hey there! We&apos;re almost done—thanks for signing up.
            <br />
            To keep things secure and make sure everything runs smoothly,
            we&apos;ll need to collect a few documents from you:
          </div>
          <ul className="mb-3">
            {documentList.map((doc) => (
              <li key={doc} className="flex items-center  gap-2 mb-1">
                <FaDiamond className="text_highlight-emerald-lighter font-semibold" />
                <span className="text_highlight-alpha font-semibold text-sm">
                  {doc}
                </span>
              </li>
            ))}
          </ul>
          <div className="text_highlight-beta text-sm leading-relaxed mb-3">
            We know it&apos;s a bit of extra effort, and we really appreciate
            your time. This step helps us keep the platform safe and trustworthy
            for everyone.
          </div>
          <div className="text_highlight-alpha font-semibold text-sm">
            Thanks for your patience—and don&apos;t worry, your information is
            in safe hands.
          </div>
          <div className="flex justify-center mt-8">
            <BaseButton
              // titleClass="text-base font-bold"
              className="w-52 h-10  bg-dark-emerald-lighter"
              onClick={onClose}
            >
              Continue
            </BaseButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterAlertModal;
