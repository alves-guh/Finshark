import axios from "axios"
import {
  CompanyBalanceSheet,
  CompanyCashFlow,
  CompanyHistoricalDividend,
  CompanyIncomeStatement,
  CompanyKeyMetrics,
  CompanyProfile,
  CompanySearch,
  CompanyTenK,
} from "./company";

interface SearchResponse{
    data: CompanySearch[];
}

type FinnhubMetricResponse = {
  metric: Record<string, number>;
};

type FinnhubProfile = {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
};

type FinnhubQuote = {
  c: number;
};

type FinnhubFinancialValue = {
  concept: string;
  value: number;
};

type FinnhubFinancialReport = {
  year: number;
  endDate: string;
  report: {
    bs?: FinnhubFinancialValue[];
    cf?: FinnhubFinancialValue[];
    ic?: FinnhubFinancialValue[];
  };
};

type FinnhubFinancialsReported = {
  data: FinnhubFinancialReport[];
};

const finnhubToken = process.env.REACT_APP_FINNHUB_API_KEY;

const findFinancialValue = (
  values: FinnhubFinancialValue[] | undefined,
  concepts: string[]
) => {
  return (
    values?.find((item) => concepts.includes(item.concept))?.value ?? 0
  );
};

const getReportedFinancials = async (query: string) => {
  return axios.get<FinnhubFinancialsReported>(
    `https://finnhub.io/api/v1/stock/financials-reported?symbol=${query}&freq=annual&token=${finnhubToken}`
  );
};

const emptyCompanyProfile = (query: string): CompanyProfile => ({
  symbol: query,
  price: 0,
  beta: 0,
  volAvg: 0,
  mktCap: 0,
  lastDiv: 0,
  range: "",
  changes: 0,
  companyName: query,
  currency: "",
  cik: "",
  isin: "",
  exchange: "",
  exchangeShortName: "",
  industry: "",
  website: "",
  description: "Company profile is not available right now.",
  ceo: "",
  sector: "",
  counter: "",
  fullTimeEmployees: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  dcfDiff: 0,
  dcf: 0,
  image: "",
  ipoDate: "",
  defaultImage: true,
  isEtf: false,
  isActivelyTrading: false,
  isAdr: false,
  isFund: false,
});

export const searchCompanies = async (query: string) => {
    try{
        const data = await axios.get<SearchResponse>(
            `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${process.env.REACT_APP_TWELVE_API_KEY}`
        );
        return data;
    } catch(error) {
          if (error instanceof Error) {
            console.log("error message:", error.message);
            return error.message;
    }

    console.log("unexpected error:", error);
    return "An expected error has occured.";
    }
}

export const getCompanyProfile = async (query: string) => {
  try {
    const [profileResult, quoteResult, metricResult] = await Promise.all([
      axios.get<FinnhubProfile>(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${query}&token=${finnhubToken}`
      ),
      axios.get<FinnhubQuote>(
        `https://finnhub.io/api/v1/quote?symbol=${query}&token=${finnhubToken}`
      ),
      axios.get<FinnhubMetricResponse>(
        `https://finnhub.io/api/v1/stock/metric?symbol=${query}&metric=all&token=${finnhubToken}`
      ),
    ]);

    const profile = profileResult.data;
    const metric = metricResult.data.metric;

    const company: CompanyProfile = {
      symbol: profile.ticker || query,
      price: quoteResult.data.c,
      beta: metric.beta,
      volAvg: 0,
      mktCap: profile.marketCapitalization,
      lastDiv: metric["currentDividendYieldTTM"],
      range: "",
      changes: 0,
      companyName: profile.name || query,
      currency: profile.currency,
      cik: "",
      isin: "",
      exchange: profile.exchange,
      exchangeShortName: profile.exchange,
      industry: profile.finnhubIndustry,
      website: profile.weburl,
      description: profile.weburl
        ? `Company website: ${profile.weburl}`
        : "Company description is not available from Finnhub.",
      ceo: "",
      sector: profile.finnhubIndustry,
      counter: profile.country,
      fullTimeEmployees: "",
      phone: profile.phone,
      address: "",
      city: "",
      state: "",
      zip: "",
      dcfDiff: 0,
      dcf: 0,
      image: profile.logo,
      ipoDate: profile.ipo,
      defaultImage: !profile.logo,
      isEtf: false,
      isActivelyTrading: true,
      isAdr: false,
      isFund: false,
    };

    return { data: [company] };
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [emptyCompanyProfile(query)] };
  }
};

export const getKeyMetrics = async (query: string) => {
  try {
    const result = await axios.get<FinnhubMetricResponse>(
      `https://finnhub.io/api/v1/stock/metric?symbol=${query}&metric=all&token=${finnhubToken}`
    );
    const metric = result.data.metric;
    const data: Partial<CompanyKeyMetrics> = {
      marketCapTTM: metric.marketCapitalization,
      currentRatioTTM: metric.currentRatioAnnual,
      roeTTM: metric.roeTTM,
      returnOnTangibleAssetsTTM: metric.roaTTM,
      freeCashFlowPerShareTTM: metric.fcfShareTTM,
      bookValuePerShareTTM: metric.bookValuePerShareAnnual,
      dividendYieldTTM: metric.currentDividendYieldTTM,
      capexPerShareTTM: metric.capexCagr5Y,
      grahamNumberTTM: metric.grahamNetNet,
      peRatioTTM: metric.peTTM,
    };

    return { data: [data as CompanyKeyMetrics] };
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [{} as CompanyKeyMetrics] };
  }
};

export const getIncomeStatement = async (query: string) => {
  try {
    const result = await getReportedFinancials(query);
    const data = result.data.data.map((item) => {
      const ic = item.report.ic;
      const revenue = findFinancialValue(ic, ["us-gaap_Revenues", "us-gaap_SalesRevenueNet"]);
      const costOfRevenue = findFinancialValue(ic, ["us-gaap_CostOfRevenue", "us-gaap_CostOfGoodsAndServicesSold"]);
      const grossProfit = findFinancialValue(ic, ["us-gaap_GrossProfit"]);
      const operatingIncome = findFinancialValue(ic, ["us-gaap_OperatingIncomeLoss"]);
      const incomeBeforeTax = findFinancialValue(ic, ["us-gaap_IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest"]);
      const netIncome = findFinancialValue(ic, ["us-gaap_NetIncomeLoss"]);

      return {
        date: item.endDate,
        symbol: query,
        reportedCurrency: "USD",
        cik: `${query}-${item.year}`,
        fillingDate: item.endDate,
        acceptedDate: item.endDate,
        calendarYear: item.year.toString(),
        period: "FY",
        revenue,
        costOfRevenue,
        grossProfit,
        grossProfitRatio: revenue ? grossProfit / revenue : 0,
        researchAndDevelopmentExpenses: findFinancialValue(ic, ["us-gaap_ResearchAndDevelopmentExpense"]),
        generalAndAdministrativeExpenses: 0,
        sellingAndMarketingExpenses: 0,
        sellingGeneralAndAdministrativeExpenses: findFinancialValue(ic, ["us-gaap_SellingGeneralAndAdministrativeExpense"]),
        otherExpenses: 0,
        operatingExpenses: findFinancialValue(ic, ["us-gaap_OperatingExpenses"]),
        costAndExpenses: costOfRevenue,
        interestIncome: findFinancialValue(ic, ["us-gaap_InterestIncomeExpenseNonOperatingNet"]),
        interestExpense: findFinancialValue(ic, ["us-gaap_InterestExpenseNonOperating"]),
        depreciationAndAmortization: findFinancialValue(ic, ["us-gaap_DepreciationDepletionAndAmortization"]),
        ebitda: 0,
        ebitdaratio: 0,
        operatingIncome,
        operatingIncomeRatio: revenue ? operatingIncome / revenue : 0,
        totalOtherIncomeExpensesNet: 0,
        incomeBeforeTax,
        incomeBeforeTaxRatio: revenue ? incomeBeforeTax / revenue : 0,
        incomeTaxExpense: findFinancialValue(ic, ["us-gaap_IncomeTaxExpenseBenefit"]),
        netIncome,
        netIncomeRatio: revenue ? netIncome / revenue : 0,
        eps: findFinancialValue(ic, ["us-gaap_EarningsPerShareBasic"]),
        epsdiluted: findFinancialValue(ic, ["us-gaap_EarningsPerShareDiluted"]),
        weightedAverageShsOut: findFinancialValue(ic, ["us-gaap_WeightedAverageNumberOfSharesOutstandingBasic"]),
        weightedAverageShsOutDil: findFinancialValue(ic, ["us-gaap_WeightedAverageNumberOfDilutedSharesOutstanding"]),
        link: "",
        finalLink: "",
      } as CompanyIncomeStatement;
    });

    return { data };
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [] };
  }
};

export const getBalanceSheet = async (query: string) => {
  try {
    const result = await getReportedFinancials(query);
    const item = result.data.data[0];
    const bs = item?.report.bs;
    const data: Partial<CompanyBalanceSheet> = {
      date: item?.endDate,
      symbol: query,
      cik: query,
      totalAssets: findFinancialValue(bs, ["us-gaap_Assets"]),
      totalCurrentAssets: findFinancialValue(bs, ["us-gaap_AssetsCurrent"]),
      cashAndCashEquivalents: findFinancialValue(bs, ["us-gaap_CashAndCashEquivalentsAtCarryingValue"]),
      propertyPlantEquipmentNet: findFinancialValue(bs, ["us-gaap_PropertyPlantAndEquipmentNet"]),
      intangibleAssets: findFinancialValue(bs, ["us-gaap_IntangibleAssetsNetExcludingGoodwill"]),
      longTermDebt: findFinancialValue(bs, ["us-gaap_LongTermDebtNoncurrent"]),
      otherCurrentLiabilities: findFinancialValue(bs, ["us-gaap_LiabilitiesCurrent"]),
      totalLiabilities: findFinancialValue(bs, ["us-gaap_Liabilities"]),
      totalCurrentLiabilities: findFinancialValue(bs, ["us-gaap_LiabilitiesCurrent"]),
      otherLiabilities: findFinancialValue(bs, ["us-gaap_OtherLiabilitiesNoncurrent"]),
      totalStockholdersEquity: findFinancialValue(bs, ["us-gaap_StockholdersEquity"]),
      retainedEarnings: findFinancialValue(bs, ["us-gaap_RetainedEarningsAccumulatedDeficit"]),
    };

    return { data: [data as CompanyBalanceSheet] };
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [{} as CompanyBalanceSheet] };
  }
};

export const getCashFlow = async (query: string) => {
  try {
    const result = await getReportedFinancials(query);
    const data = result.data.data.map((item) => {
      const cf = item.report.cf;
      return {
        date: item.endDate,
        symbol: query,
        cik: `${query}-${item.year}`,
        operatingCashFlow: findFinancialValue(cf, ["us-gaap_NetCashProvidedByUsedInOperatingActivities"]),
        netCashUsedForInvestingActivites: findFinancialValue(cf, ["us-gaap_NetCashProvidedByUsedInInvestingActivities"]),
        netCashUsedProvidedByFinancingActivities: findFinancialValue(cf, ["us-gaap_NetCashProvidedByUsedInFinancingActivities"]),
        cashAtEndOfPeriod: findFinancialValue(cf, ["us-gaap_CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"]),
        capitalExpenditure: findFinancialValue(cf, ["us-gaap_PaymentsToAcquirePropertyPlantAndEquipment"]),
        commonStockIssued: findFinancialValue(cf, ["us-gaap_ProceedsFromStockOptionsExercised"]),
        freeCashFlow:
          findFinancialValue(cf, ["us-gaap_NetCashProvidedByUsedInOperatingActivities"]) -
          findFinancialValue(cf, ["us-gaap_PaymentsToAcquirePropertyPlantAndEquipment"]),
      } as CompanyCashFlow;
    });

    return { data };
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [] };
  }
};  

export const getCompData = async (query: string) => {
  try {
    const data = await axios.get<string[]>(
      `https://finnhub.io/api/v1/stock/peers?symbol=${query}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`
    );
    return data;
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [] };
  }
};

export const getTenK = async (query: string) => {
  try {
    const data = await axios.get<CompanyTenK[]>(
      `https://finnhub.io/api/v1/stock/filings?symbol=${query}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`
    );

    return data;
  } catch (error: any) {
    console.log("error message: ", error.message);
    return { data: [] };
  }
};

export const getHistoricalDividend = async (
  query: string
): Promise<{ data: CompanyHistoricalDividend }> => {
  return { data: { symbol: query, historical: [] } };
};
