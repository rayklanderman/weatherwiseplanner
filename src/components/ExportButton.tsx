import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportAsCSV, exportAsJSON } from "../utils/exportHandler";
import { WeatherQueryResponse } from "../types/weather";

interface ExportButtonProps {
  data?: WeatherQueryResponse;
}

export const ExportButton = ({ data }: ExportButtonProps) => {
  if (!data) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light">
        <ArrowDownTrayIcon className="h-4 w-4" />
        Export
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-lg focus:outline-none">
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left ${active ? "bg-brand/10 text-brand-dark" : "text-slate-700"}`}
                onClick={() => exportAsCSV(data)}
              >
                Download CSV
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left ${active ? "bg-brand/10 text-brand-dark" : "text-slate-700"}`}
                onClick={() => exportAsJSON(data)}
              >
                Download JSON
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
