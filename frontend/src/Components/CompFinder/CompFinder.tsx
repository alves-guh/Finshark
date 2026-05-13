import React, { useEffect, useState } from "react";
import CompFinderItem from "./CompFinderItem/CompFinderItem";
import { getCompData } from "../../api";
import Spinner from "../Spinner/Spinner";

type Props = {
  ticker: string;
};

const CompFinder = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<string[]>([]);

  useEffect(() => {
    const getComps = async () => {
      const value = await getCompData(ticker);

      console.log(value?.data);

      if (value?.data) {
        setCompanyData(value.data);
      }
    };

    getComps();
  }, [ticker]);

  return (
    <div className="inline-flex rounded-md shadow-sm m-4" role="group">
      {companyData.length > 0 ? (
        companyData.map((ticker) => {
          return <CompFinderItem key={ticker} ticker={ticker} />;
        })
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default CompFinder;