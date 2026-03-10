import React from "react";
import { Skeleton } from "primereact/skeleton";

interface Field {
  name: string;
  colSize?: number; // 1–12 grid system
  skeletonHeight?: string;
}

interface SkeletonFormProps {
  fields: Field[];
  skeletonType?: "row" | "column";
}

const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields,
  skeletonType = "row",
}) => {
  // convert 12-grid colSize to Tailwind grid span
  const getColSpan = (colSize?: number) => {
    const span = colSize ? Math.round((colSize / 12) * 12) : 6;
    return `md:col-span-${span} col-span-12`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form className="space-y-4">

        {/* Row Layout */}
        {skeletonType === "row" ? (
          <div className="grid grid-cols-12 gap-4">
            {fields.map((field, index) => (
              <div key={index} className={getColSpan(field.colSize)}>
                <div className="space-y-2">
                  <Skeleton width="40%" height="1rem" />
                  <Skeleton
                    width="100%"
                    height={field.skeletonHeight || "2.5rem"}
                  />
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="col-span-12 flex justify-end gap-4 pt-4">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="120px" height="2.5rem" />
            </div>
          </div>
        ) : (
          /* Column Layout */
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Skeleton width="40%" height="1rem" />
                <Skeleton
                  width="100%"
                  height={field.skeletonHeight || "2.5rem"}
                />
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="120px" height="2.5rem" />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SkeletonForm;
