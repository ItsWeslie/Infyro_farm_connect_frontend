import { Tractor, LayoutDashboard, MapPinned, Sprout, ClipboardList, Wallet, Wheat } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import FarmDetailsOverview from "./FarmDetailsOverview";
import FarmDetailsFields from "./FarmDetailsFields";
import FarmDetailsCrops from "./FarmDetailsCrops";
import FarmDetailsActivities from "./FarmDetailsActivities";
import FarmDetailsExpenses from "./FarmDetailsExpenses";
import FarmDetailsHarvests from "./FarmDetailsHarvests";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function FarmDetailsDialog({ farm, onClose, triggerRef }) {
  return (
    <Dialog open={Boolean(farm)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="ff-farm-details-dialog"
        onCloseAutoFocus={(event) => {
          if (triggerRef.current?.isConnected) {
            event.preventDefault();
            triggerRef.current.focus();
          }
        }}
      >
        <DialogHeader className="ff-farm-details-header">
          <div className="ff-farm-details-icon" aria-hidden="true"><Tractor size={23} /></div>
          <div className="ff-farm-details-heading">
            <span className="section-kicker">FARM DETAILS</span>
            <DialogTitle>{farm?.name || "Farm details"}</DialogTitle>
            <DialogDescription>Explore the details of this farm.</DialogDescription>
          </div>
        </DialogHeader>
        <Tabs key={farm?.id} defaultValue="overview" className="ff-details-tabs">
          <TabsList variant="line" aria-label="Farm details sections">
            <TabsTrigger value="overview"><LayoutDashboard size={15} aria-hidden="true" />Overview</TabsTrigger>
            <TabsTrigger value="fields"><MapPinned size={15} aria-hidden="true" />Fields</TabsTrigger>
            <TabsTrigger value="crops"><Sprout size={15} aria-hidden="true" />Crops</TabsTrigger>
            <TabsTrigger value="activities"><ClipboardList size={15} aria-hidden="true" />Activities</TabsTrigger>
            <TabsTrigger value="expenses"><Wallet size={15} aria-hidden="true" />Expenses</TabsTrigger>
            <TabsTrigger value="harvests"><Wheat size={15} aria-hidden="true" />Harvests</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <FarmDetailsOverview farm={farm} />
          </TabsContent>
          <TabsContent value="fields">
            <FarmDetailsFields farm={farm} />
          </TabsContent>
          <TabsContent value="crops">
            <FarmDetailsCrops farm={farm} />
          </TabsContent>
          <TabsContent value="activities">
            <FarmDetailsActivities farm={farm} />
          </TabsContent>
          <TabsContent value="expenses">
            <FarmDetailsExpenses farm={farm} />
          </TabsContent>
          <TabsContent value="harvests">
            <FarmDetailsHarvests farm={farm} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
