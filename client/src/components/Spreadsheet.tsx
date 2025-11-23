import React, { useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import { HyperFormula } from 'hyperformula';
import 'handsontable/dist/handsontable.full.min.css';

// Register Handsontable modules
registerAllModules();

interface Props {
  data: any[][];
  onChange: (data: any[][]) => void;
  forwardRef: any;
}

export const Spreadsheet: React.FC<Props> = ({ data, onChange, forwardRef }) => {
  // FIX: Use <any> here to avoid strict type conflicts with the library
  const hotRef = useRef<any>(null);

  useEffect(() => {
    // We bind the internal Handsontable instance to the parent ref
    if (forwardRef && hotRef.current) {
      forwardRef.current = hotRef.current.hotInstance;
    }
  }, [forwardRef]);

  return (
    <div className="w-full h-full">
      <HotTable
        ref={hotRef}
        data={data}
        licenseKey="non-commercial-and-evaluation"
        rowHeaders={true}
        colHeaders={true}
        height="100%"
        width="100%"
        manualColumnResize={true}
        manualRowResize={true}
        formulas={{ engine: HyperFormula }}
        contextMenu={true}
        fillHandle={true} 
        afterChange={(changes, source) => {
          // Only trigger save if the change didn't come from loading initial data
          if (source !== 'loadData' && hotRef.current) {
            onChange(hotRef.current.hotInstance.getData());
          }
        }}
      />
    </div>
  );
};