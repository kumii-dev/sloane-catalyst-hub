import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Mentorship from "./pages/Mentorship";
import FindMentor from "./pages/FindMentor";
import MentorProfile from "./pages/MentorProfile";
import EditMentorProfile from "./pages/EditMentorProfile";
import BecomeMentor from "./pages/BecomeMentor";
import MenteeDashboard from "./pages/MenteeDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import MentorAvailability from "./pages/MentorAvailability";
import FundingHub from "./pages/FundingHub";
import BrowseFunding from "./pages/BrowseFunding";
import StartupDashboard from "./pages/StartupDashboard";
import FunderDashboard from "./pages/FunderDashboard";
import Services from "./pages/Services";
import ServiceCategory from "./pages/ServiceCategory";
import ServiceDetail from "./pages/ServiceDetail";
import Resources from "./pages/Resources";
import ResourceCategory from "./pages/ResourceCategory";
import ResourceDetail from "./pages/ResourceDetail";
import AccessToMarket from "./pages/AccessToMarket";
import CreditScore from "./pages/CreditScore";
import CreditScoreAssessment from "./pages/CreditScoreAssessment";
import CreditScoreResults from "./pages/CreditScoreResults";
import DocumentGenerator from "./pages/DocumentGenerator";
import FinancialModelBuilder from "./pages/FinancialModelBuilder";
import ValuationModel from "./pages/ValuationModel";
import VideoCreator from "./pages/VideoCreator";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import MySubscriptions from "./pages/MySubscriptions";
import AdminDashboard from "./pages/AdminDashboard";
import CohortManager from "./pages/CohortManager";
import MessagingHub from "./pages/MessagingHub";
import About from "./pages/About";
import SessionReview from "./pages/SessionReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/find-mentor" element={<FindMentor />} />
            <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/mentor-availability" element={<MentorAvailability />} />
          <Route path="/mentor/:id" element={<MentorProfile />} />
          <Route path="/edit-mentor-profile" element={<EditMentorProfile />} />
          <Route path="/become-mentor" element={<BecomeMentor />} />
            <Route path="/funding" element={<FundingHub />} />
            <Route path="/funding/browse" element={<BrowseFunding />} />
            <Route path="/funding/startup-dashboard" element={<StartupDashboard />} />
            <Route path="/funding/funder-dashboard" element={<FunderDashboard />} />
            <Route path="/access-to-market" element={<AccessToMarket />} />
            <Route path="/access-to-market/document-generator" element={<DocumentGenerator />} />
            <Route path="/access-to-market/financial-model" element={<FinancialModelBuilder />} />
            <Route path="/access-to-market/valuation" element={<ValuationModel />} />
          <Route path="/credit-score" element={<CreditScore />} />
          <Route path="/credit-score/assessment" element={<CreditScoreAssessment />} />
          <Route path="/credit-score/results/:assessmentId" element={<CreditScoreResults />} />
            <Route path="/listings/create" element={<CreateListing />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-subscriptions" element={<MySubscriptions />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cohorts" element={<CohortManager />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/category/:slug" element={<ServiceCategory />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/category/:slug" element={<ResourceCategory />} />
            <Route path="/resources/:slug" element={<ResourceDetail />} />
            <Route path="/messaging-hub" element={<MessagingHub />} />
            <Route path="/about" element={<About />} />
            <Route path="/review/:sessionId" element={<SessionReview />} />
            <Route path="/video-creator" element={<VideoCreator />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
