import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportAsCSV, exportAsJSON } from "../utils/exportHandler";
import { WeatherQueryResponse } from "../types/weather";

interface ExportButtonProps {
  data?: WeatherQueryResponse;
  aiInsights?: string;
}

export const ExportButton = ({ data, aiInsights }: ExportButtonProps) => {
  if (!data) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-nasa-red to-orange-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-nasa-red/50">
        <ArrowDownTrayIcon className="h-5 w-5" />
        <span>Export Data</span>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl border-2 border-slate-200 bg-white p-2 shadow-2xl focus:outline-none">
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-semibold ${active ? "bg-emerald-50 text-emerald-900" : "text-slate-700"}`}
                onClick={() => exportAsCSV(data, aiInsights)}
              >
                <span className="text-2xl">📊</span>
                <div>
                  <div>Download CSV</div>
                  <div className="text-xs font-normal text-slate-500">For Excel/Sheets</div>
                </div>
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-semibold ${active ? "bg-emerald-50 text-emerald-900" : "text-slate-700"}`}
                onClick={() => exportAsJSON(data, aiInsights)}
              >
                <span className="text-2xl">💾</span>
                <div>
                  <div>Download JSON</div>
                  <div className="text-xs font-normal text-slate-500">For developers</div>
                </div>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
