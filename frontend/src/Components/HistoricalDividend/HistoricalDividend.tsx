import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { getHistoricalDividend } from "../../api";
import SimpleLineChart from "../SimpleLineChart/SimpleLineChart";
import { Dividend } from "../../company";

type Props = {};

const HistoricalDividend = (props: Props) => {
  const ticker = useOutletContext<string>();
  const [dividend, setDividend] = useState<Dividend[]>();

  useEffect(() => {
    const fetchHistoricalDividend = async () => {
      setDividend(undefined);
      const value = await getHistoricalDividend(ticker);
      setDividend(
        value?.data.historical.slice(0, 18).sort(function (a, b) {
          var c = new Date(a.date);
          var d = new Date(b.date);
          return c.getTime() - d.getTime();
        })
      );
    };
    fetchHistoricalDividend();
  }, [ticker]);
  return (
    <>
      {dividend && dividend.length > 0 && dividend !== undefined ? (
        <SimpleLineChart data={dividend} xAxis="label" dataKey="dividend" />
      ) : (
        <h1 className="ml-3">Dividend history is not available.</h1>
      )}
    </>
  );
};

export default HistoricalDividend;
