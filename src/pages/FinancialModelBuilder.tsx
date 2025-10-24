import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  FileSpreadsheet, 
  TrendingUp, 
  Building, 
  Link2,
  Play,
  Download,
  AlertCircle,
  CheckCircle2,
  Save,
  FolderOpen,
  Settings
} from "lucide-react";
import { useModelStore } from "@/store/modelStore";
import { calculateModel } from "@/lib/modelEngine";
import { validateBalanceSheet } from "@/lib/balanceSheetValidator";
import { exportToExcel } from "@/lib/excelExport";
import { saveModel, loadModel, listModels, deleteModel } from "@/lib/modelPersistence";
import { FinancialTable } from "@/components/financial-model/FinancialTable";
import { CompanyInfoDialog } from "@/components/financial-model/CompanyInfoDialog";
import { RevenueDialog } from "@/components/financial-model/RevenueDialog";
import { COGSDialog } from "@/components/financial-model/COGSDialog";
import { OpexDialog } from "@/components/financial-model/OpexDialog";
import { CapexDialog } from "@/components/financial-model/CapexDialog";
import { WorkingCapitalDialog } from "@/components/financial-model/WorkingCapitalDialog";
import { DebtDialog } from "@/components/financial-model/DebtDialog";
import { EquityDialog } from "@/components/financial-model/EquityDialog";
import { TaxDialog } from "@/components/financial-model/TaxDialog";
import { HistoricalDataDialog } from "@/components/financial-model/HistoricalDataDialog";
import { toast } from "sonner";

const FinancialModelBuilder = () => {
  const modelState = useModelStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [showCOGSDialog, setShowCOGSDialog] = useState(false);
  const [showOpexDialog, setShowOpexDialog] = useState(false);
  const [showCapexDialog, setShowCapexDialog] = useState(false);
  const [showWCDialog, setShowWCDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showEquityDialog, setShowEquityDialog] = useState(false);
  const [showTaxDialog, setShowTaxDialog] = useState(false);
  const [showHistoricalDialog, setShowHistoricalDialog] = useState(false);
  const [modelOutput, setModelOutput] = useState<ReturnType<typeof calculateModel> | null>(null);

  const features = [
    {
      icon: Building,
      title: "Multi-Standard Support",
      description: "Switch between IFRS and US GAAP with automatic adjustments"
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scenarios",
      description: "Model Base, Best, and Worst case scenarios with instant recalculation"
    },
    {
      icon: Link2,
      title: "Fully Integrated",
      description: "All statements automatically linked with supporting schedules"
    }
  ];

  // Calculate completeness
  const completeness = useMemo(() => {
    let completed = 0;
    let total = 9;
    
    if (modelState.company.name) completed++;
    if (modelState.revenue.length > 0) completed++;
    if (modelState.cogs.method) completed++;
    if (modelState.opex.length > 0) completed++;
    if (modelState.capex.length > 0) completed++;
    if (modelState.workingCapital.DSO > 0) completed++;
    if (modelState.debt.length > 0 || modelState.equity.length > 0) completed++;
    if (modelState.tax.ratePct > 0) completed++;
    if (modelState.historicalData.length > 0) completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [modelState]);

  const handleCalculate = () => {
    try {
      const output = calculateModel(modelState);
      setModelOutput(output);
      
      // Validate
      const validation = validateBalanceSheet(output.balanceSheet, output.periods);
      
      if (validation.hasErrors) {
        toast.error(`Model has ${validation.errors.length} validation errors`, {
          description: "Check the Validation tab for details"
        });
      } else {
        toast.success("Model calculated successfully!", {
          description: "All statements balanced correctly"
        });
      }
      
      setActiveTab("income-statement");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("Failed to calculate model", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const handleExport = () => {
    if (!modelOutput) {
      toast.error("No model to export", {
        description: "Please calculate the model first"
      });
      return;
    }

    try {
      exportToExcel(modelOutput, modelState.company.name || "Financial Model");
      toast.success("Model exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export model");
    }
  };

  const handleSave = async () => {
    try {
      const modelName = modelState.company.name || `Model ${new Date().toISOString()}`;
      const id = await saveModel(modelName, modelState);
      modelState.setCurrentModelId(id);
      toast.success("Model saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save model");
    }
  };

  const handleLoad = async () => {
    try {
      const models = await listModels();
      if (models.length === 0) {
        toast.info("No saved models found");
        return;
      }
      
      // For simplicity, load the most recent model
      // In production, show a dialog to select
      const latestModel = models[0];
      const loadedState = await loadModel(latestModel.id);
      
      if (loadedState) {
        modelState.loadModelState(loadedState);
        toast.success(`Loaded model: ${latestModel.name}`);
      }
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load model");
    }
  };

  const validationResults = useMemo(() => {
    if (!modelOutput) return null;
    return validateBalanceSheet(modelOutput.balanceSheet, modelOutput.periods);
  }, [modelOutput]);

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Financial Model Builder</Badge>
                  <h1 className="text-4xl font-bold">
                    3-Statement Financial Model
                  </h1>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Build dynamic, fully integrated Income Statement, Balance Sheet, and Cash Flow 
                models with {modelState.standard} support
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={() => modelState.setStandard(modelState.standard === 'IFRS' ? 'GAAP' : 'IFRS')} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                {modelState.standard}
              </Button>
              <Button onClick={handleLoad} variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load
              </Button>
              <Button onClick={handleSave} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Setup Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completeness.completed}/{completeness.total} steps
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="w-12 h-12 mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-4xl grid-cols-6">
                <TabsTrigger value="overview">Setup</TabsTrigger>
                <TabsTrigger value="income-statement" disabled={!modelOutput}>Income</TabsTrigger>
                <TabsTrigger value="balance-sheet" disabled={!modelOutput}>Balance</TabsTrigger>
                <TabsTrigger value="cash-flow" disabled={!modelOutput}>Cash Flow</TabsTrigger>
                <TabsTrigger value="schedules" disabled={!modelOutput}>Schedules</TabsTrigger>
                <TabsTrigger value="validation" disabled={!modelOutput}>Validation</TabsTrigger>
              </TabsList>

              {modelOutput && (
                <div className="flex gap-2">
                  <Button onClick={handleCalculate} variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Recalculate
                  </Button>
                  <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}
            </div>

            {/* Setup Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCompanyDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Company Information
                      {modelState.company.name && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.company.name || "Set up company details and model parameters"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowHistoricalDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Historical Data (Optional)
                      {modelState.historicalData.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.historicalData.length > 0 ? `${modelState.historicalData.length} periods` : "Import historical financials"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowRevenueDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Revenue Drivers
                      {modelState.revenue.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.revenue.length > 0 ? `${modelState.revenue.length} segments` : "Configure revenue streams"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCOGSDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Cost of Goods Sold
                      {modelState.cogs.method && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.cogs.method || "Set COGS methodology"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowOpexDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Operating Expenses
                      {modelState.opex.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.opex.length > 0 ? `${modelState.opex.length} categories` : "Define OpEx structure"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCapexDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Capital Expenditures
                      {modelState.capex.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.capex.length > 0 ? `${modelState.capex.length} items` : "Plan capex investments"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowWCDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Working Capital
                      {modelState.workingCapital.DSO > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.workingCapital.DSO > 0 ? "Configured" : "Set AR, Inventory, AP days"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDebtDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Debt Financing
                      {modelState.debt.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.debt.length > 0 ? `${modelState.debt.length} facilities` : "Configure debt structure"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowEquityDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Equity Financing
                      {modelState.equity.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.equity.length > 0 ? `${modelState.equity.length} rounds` : "Plan equity raises"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowTaxDialog(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Tax Assumptions
                      {modelState.tax.ratePct > 0 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </CardTitle>
                    <CardDescription>
                      {modelState.tax.ratePct > 0 ? `${modelState.tax.ratePct}% rate` : "Set tax parameters"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleCalculate}
                  disabled={completeness.completed < 5}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Calculate Model
                </Button>
              </div>

              {completeness.completed < 5 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete at least Company Info, Revenue, COGS, OpEx, and Tax to calculate the model
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Financial Statements Tabs */}
            <TabsContent value="income-statement">
              {modelOutput && (
                <FinancialTable
                  data={modelOutput.incomeStatement}
                  periods={modelOutput.periods}
                  type="income-statement"
                  currency={modelState.company.currency}
                />
              )}
            </TabsContent>

            <TabsContent value="balance-sheet">
              {modelOutput && (
                <FinancialTable
                  data={modelOutput.balanceSheet}
                  periods={modelOutput.periods}
                  type="balance-sheet"
                  currency={modelState.company.currency}
                />
              )}
            </TabsContent>

            <TabsContent value="cash-flow">
              {modelOutput && (
                <FinancialTable
                  data={modelOutput.cashFlowStatement}
                  periods={modelOutput.periods}
                  type="cash-flow"
                  currency={modelState.company.currency}
                />
              )}
            </TabsContent>

            <TabsContent value="schedules">
              {modelOutput && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Depreciation Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FinancialTable
                        data={modelOutput.depreciationSchedule}
                        periods={modelOutput.periods}
                        type="depreciation"
                        currency={modelState.company.currency}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Liquidity Ratios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FinancialTable
                        data={modelOutput.liquidityRatios}
                        periods={modelOutput.periods}
                        type="ratios"
                        currency={modelState.company.currency}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="validation">
              {validationResults && (
                <div className="space-y-4">
                  {validationResults.hasErrors ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Model has {validationResults.errors.length} validation error(s)
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        All validation checks passed! Model is balanced.
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResults.errors.map((error, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          {error.type}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{error.message}</p>
                        <p className="text-xs text-muted-foreground">Period: {error.period}</p>
                        <p className="text-xs text-muted-foreground">
                          Expected: {error.expected?.toFixed(2)} | Actual: {error.actual?.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Dialogs */}
      <CompanyInfoDialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog} />
      <RevenueDialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog} />
      <COGSDialog open={showCOGSDialog} onOpenChange={setShowCOGSDialog} />
      <OpexDialog open={showOpexDialog} onOpenChange={setShowOpexDialog} />
      <CapexDialog open={showCapexDialog} onOpenChange={setShowCapexDialog} />
      <WorkingCapitalDialog open={showWCDialog} onOpenChange={setShowWCDialog} />
      <DebtDialog open={showDebtDialog} onOpenChange={setShowDebtDialog} />
      <EquityDialog open={showEquityDialog} onOpenChange={setShowEquityDialog} />
      <TaxDialog open={showTaxDialog} onOpenChange={setShowTaxDialog} />
      <HistoricalDataDialog open={showHistoricalDialog} onOpenChange={setShowHistoricalDialog} />
    </Layout>
  );
};

export default FinancialModelBuilder;
