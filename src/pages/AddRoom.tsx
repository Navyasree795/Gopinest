import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MapPin, IndianRupee, Users, Image as ImageIcon, FileText, PlusCircle, X, Loader2, CheckCircle2, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useAddRoom } from "@/hooks/useAddRoom";
import { useAuth } from "@/context/AuthContext";
import { createPaymentOrder, verifyPayment, loadRazorpayScript } from "@/lib/api";

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

const roomTypes = ["Single Room", "Shared Room", "1 BHK", "2 BHK", "Studio", "PG"];

const tenantTypes = ["Student", "Working Professional", "Family", "Any"];

const amenitiesList = [
  "WiFi",
  "AC",
  "Furnished",
  "Parking",
  "Power Backup",
  "Water Supply",
  "Meals",
  "Laundry",
  "Gym",
  "Security",
];

const AddRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addRoomMutation = useAddRoom();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    location: "",
    roomType: "",
    rent: "",
    deposit: "",
    tenantType: "",
    description: "",
    amenities: [] as string[],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity.toLowerCase())
        ? prev.amenities.filter((a) => a !== amenity.toLowerCase())
        : [...prev.amenities, amenity.toLowerCase()],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city || !formData.roomType || !formData.tenantType) {
      toast({
        title: "Missing selection",
        description: "Please select city, room type, and tenant type.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of the room.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("city", formData.city);
    data.append("location", formData.location);
    data.append("roomType", formData.roomType);
    data.append("rent", formData.rent);
    data.append("deposit", formData.deposit);
    data.append("tenantType", formData.tenantType);
    data.append("description", formData.description);

    formData.amenities.forEach((amenity) => {
      data.append("amenities", amenity);
    });

    selectedFiles.forEach((file) => {
      data.append("images", file);
    });

    try {
      // 1. Create Room (as Unpublished)
      const roomResponse = await addRoomMutation.mutateAsync(data);
      const roomId = roomResponse.data._id;
      setCreatedRoomId(roomId);

      setIsProcessingPayment(true);

      // 2. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast({ title: "Payment Error", description: "Failed to load payment gateway.", variant: "destructive" });
        setIsProcessingPayment(false);
        return;
      }

      // 3. Create Razorpay Order
      const order = await createPaymentOrder(roomId);

      // 3.5 Handle Mock Payment in Development
      if (order.mock) {
        console.log("[PAYMENT] Mock order detected.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await verifyPayment({
          roomId,
          razorpayOrderId: order.id,
          razorpayPaymentId: `mock_pay_${Date.now()}`,
          razorpaySignature: "mock_signature",
        });
        
        setIsProcessingPayment(false);
        setIsSuccessModalOpen(true);
        return;
      }

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SmartStay Hub",
        description: "Listing Fee for ₹39",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              roomId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setIsSuccessModalOpen(true);
          } catch (error: any) {
            toast({ title: "Verification Failed", description: error.message || "Payment verification failed.", variant: "destructive" });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: { name: user?.name || "", contact: user?.mobile || "" },
        theme: { color: "#0F172A" },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast({ title: "Payment Cancelled", description: "Listing will remain unpublished until payment is complete." });
            navigate("/dashboard");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <PageHeader backTo="/dashboard" title="Add Room" />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl card-shadow p-6 space-y-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Home className="text-primary-foreground" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Room Details
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                placeholder="e.g., Spacious 1BHK in Andheri"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* City & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  City
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Locality / Area</Label>
              <Input
                placeholder="e.g., Andheri West"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-primary" />
                  Monthly Rent
                </Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-primary" />
                  Deposit
                </Label>
                <Input
                  type="number"
                  placeholder="30000"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
            </div>

            {/* Tenant Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                Preferred Tenant
              </Label>
              <Select
                value={formData.tenantType}
                onValueChange={(value) => setFormData({ ...formData, tenantType: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select tenant type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {tenantTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                Description
              </Label>
              <Textarea
                placeholder="Describe your room, locality, nearby facilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity.toLowerCase())}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <label
                      htmlFor={amenity}
                      className="text-sm cursor-pointer text-foreground"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon size={14} className="text-primary" />
                Room Images (Max 5)
              </Label>
              
              <div 
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-sm text-muted-foreground">
                  Tap to upload room images
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previews.map((preview, index) => (
                    <div key={preview} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-20 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={addRoomMutation.isPending || isProcessingPayment}
              className="w-full h-14 text-lg font-semibold btn-shadow"
            >
              {addRoomMutation.isPending || isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {addRoomMutation.isPending ? "Listing Room..." : "Processing Payment..."}
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2" size={20} />
                  List My Room (₹39)
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md border-none card-shadow">
          <DialogHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={48} />
            </div>
            <DialogTitle className="text-2xl font-bold">Room Published!</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Your room listing is now live and visible to potential tenants on SmartStay Hub.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full h-12 text-lg font-semibold"
              onClick={() => navigate(`/room/${createdRoomId}`)}
            >
              <ExternalLink className="mr-2" size={20} />
              View Listing
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-12 border-green-500 text-green-600 hover:bg-green-50 font-semibold"
              onClick={() => {
                const message = encodeURIComponent(`Hi, I just listed my room on SmartStay Hub! Check it out: ${window.location.origin}/room/${createdRoomId}`);
                window.open(`https://wa.me/?text=${message}`, "_blank");
              }}
            >
              <MessageCircle className="mr-2" size={20} />
              Share on WhatsApp
            </Button>
          </div>

          <DialogFooter className="sm:justify-center pt-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddRoom;
