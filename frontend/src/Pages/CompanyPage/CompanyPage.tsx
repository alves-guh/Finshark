import React, { useEffect, useState } from "react";
import { CompanyProfile } from "../../company";
import { useParams } from "react-router";
import { getCompanyProfile } from "../../api";
import Sidebar from "../../Components/Sidebar/Sidebar";
import CompanyDashboard from "../../Components/CompanyDashboard/CompanyDashboard";
import Tile from "../../Components/Tile/Tile";
import Spinner from "../../Components/Spinner/Spinner";

interface Props {}

const CompanyPage = (props: Props) => {
  let { ticker } = useParams();

  const [company, setCompany] = useState<CompanyProfile>();

  useEffect(() => {
    const getProfileInit = async () => {
      setCompany(undefined);
      const result = await getCompanyProfile(ticker!);
      console.log("RESULTADO API:", result);
      console.log("DATA:", result?.data);
      console.log("PRIMEIRO ITEM:", result?.data?.[0]);

      if (!result || !result.data) return;
      setCompany(result?.data[0]);
    };
    getProfileInit();
  }, [ticker]);

  return (
    <>
      {company !== undefined ? (
        <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden">
          <Sidebar />
          <CompanyDashboard ticker={ticker!}>
            <Tile title="Company Name" subTitle={company.companyName} />
            <Tile title="Price" subTitle={company?.price ? "$" + company.price.toString() : "N/A"} />
            <Tile title="DCF" subTitle={company?.dcf ? "$" + company.dcf.toString() : "N/A"} />
            <Tile title="Sector" subTitle={company.sector} />
            {/*<CompFinder ticker={company.symbol} />
            <TenKFinder ticker={company.symbol} />*/}
            <p className="bg-white shadow rounded text-medium font-medium text-gray-900 p-3 mt-1 m-4">
              {company.description}
            </p>
          </CompanyDashboard>
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default CompanyPage;
