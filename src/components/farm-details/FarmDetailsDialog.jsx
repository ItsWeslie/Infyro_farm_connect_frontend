import { Tractor } from "lucide-react";
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
      </DialogContent>
    </Dialog>
  );
}
