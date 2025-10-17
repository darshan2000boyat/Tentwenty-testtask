import { Dialog, DialogTitle, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";

interface FormValues {
  project: string;
  typeOfWork: string;
  description: string;
  hours: number;
}

const validationSchema = Yup.object({
  project: Yup.string().required("Project is required"),
  typeOfWork: Yup.string().required("Type of work is required"),
  description: Yup.string()
    .min(10, "At least 10 characters")
    .required("Task description is required"),
  hours: Yup.number()
    .required("Hours are required"),
});

export default function NewEntryModal({
  isOpen,
  setIsOpen,
  date,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: string;
}) {
  const formik = useFormik<FormValues>({
    initialValues: {
      project: "",
      typeOfWork: "",
      description: "",
      hours: 1,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("✅ Submitted:", values);
      alert("Entry added successfully!");
      setIsOpen(false);
      formik.resetForm();
    },
  });

  const increment = () =>
    formik.values.hours < 40 ? formik.setFieldValue("hours", formik.values.hours + 1) : null;
  const decrement = () =>
    formik.setFieldValue("hours", Math.max(1, formik.values.hours - 1));

  return (
    <>
      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 text-black"
          onClose={() => setIsOpen(false)}
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          {/* Modal Panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <DialogTitle className="text-lg font-semibold text-gray-800 mb-4">
                  Add New Entry
                </DialogTitle>

                <form onSubmit={formik.handleSubmit} className="space-y-4 text-sm">
                  {/* Project */}
                  <div className="lg:w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Project *
                    </label>
                    <select
                      name="project"
                      value={formik.values.project}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select project</option>
                      <option value="Project A">Project A</option>
                      <option value="Project B">Project B</option>
                    </select>
                    {formik.touched.project && formik.errors.project && (
                      <p className="text-sm text-red-500">
                        {formik.errors.project}
                      </p>
                    )}
                  </div>

                  {/* Type of Work */}
                  <div  className="lg:w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Work *
                    </label>
                    <select
                      name="typeOfWork"
                      value={formik.values.typeOfWork}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="Bug Fixes">Bug Fixes</option>
                      <option value="Feature Development">
                        Feature Development
                      </option>
                      <option value="Testing">Testing</option>
                    </select>
                    {formik.touched.typeOfWork && formik.errors.typeOfWork && (
                      <p className="text-sm text-red-500">
                        {formik.errors.typeOfWork}
                      </p>
                    )}
                  </div>

                  {/* Task Description */}
                  <div  className="w-4/5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Description *
                    </label>
                    <textarea
                      name="description"
                      rows={6}
                      placeholder="Write text here..."
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border rounded-lg p-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-sm text-red-500">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours *
                    </label>
                    <div className="flex items-center h-8">
                      <button
                        type="button"
                        onClick={decrement}
                        className="px-3 py-2 text-xs border border-gray-300 cursor-pointer rounded-tl-lg rounded-bl-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <FiMinus />
                      </button>
                      <span
                        className="w-10 h-full flex items-center justify-center border select-none border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      >{formik.values.hours}</span>
                      <button
                        type="button"
                        onClick={increment}
                        className="px-3 py-2 text-xs border border-gray-300 cursor-pointer rounded-tr-lg rounded-br-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {formik.touched.hours && formik.errors.hours && (
                      <p className="text-sm text-red-500">
                        {formik.errors.hours}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2 w-full border-t border-gray-300">
                    <button
                      type="submit"
                      className="text-sm w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-sm w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
