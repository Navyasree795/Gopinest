import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, IndianRupee, Users, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import PageHeader from "@/components/PageHeader";

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

const FindRoom = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState([5000, 25000]);
  const [tenantType, setTenantType] = useState("any");
  const [entryDate, setEntryDate] = useState<Date>();
  const [vacateDate, setVacateDate] = useState<Date>();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (location) params.append("location", location);
    params.append("minRent", budget[0].toString());
    params.append("maxRent", budget[1].toString());
    
    let mappedTenantType = tenantType;
    if (tenantType === "working") mappedTenantType = "working professional";
    params.append("tenantType", mappedTenantType);

    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <PageHeader backTo="/dashboard" title="Find Room" />

      <main className="container px-4 py-8 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl card-shadow p-6 animate-slide-up">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Search className="text-primary" size={22} />
            Search Filters
          </h2>

          <div className="space-y-6">
            {/* City Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                City
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {cities.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Locality / Area
              </Label>
              <Input
                placeholder="e.g., Andheri West, Koramangala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Budget Slider */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <IndianRupee size={16} className="text-primary" />
                Budget Range
              </Label>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={1000}
                max={50000}
                step={1000}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  ₹{budget[0].toLocaleString()}
                </span>
                <span className="text-muted-foreground">to</span>
                <span className="font-medium text-foreground">
                  ₹{budget[1].toLocaleString()}
                </span>
              </div>
            </div>

            {/* Entry Date & Vacate Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  Entry Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !entryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {entryDate ? format(entryDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={entryDate}
                      onSelect={setEntryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  Vacate Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !vacateDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {vacateDate ? format(vacateDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={vacateDate}
                      onSelect={setVacateDate}
                      disabled={(date) => date < (entryDate || new Date())}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tenant Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Tenant Type
              </Label>
              <RadioGroup
                value={tenantType}
                onValueChange={setTenantType}
                className="flex flex-wrap gap-3"
              >
                {[
                  { value: "any", label: "Any" },
                  { value: "student", label: "Student" },
                  { value: "working", label: "Working Professional" },
                  { value: "family", label: "Family" },
                ].map((type) => (
                  <div key={type.value} className="flex items-center">
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.value}
                      className="px-4 py-2 rounded-full border-2 border-border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:border-primary/50"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full h-14 text-lg font-semibold btn-shadow mt-4"
            >
              <Search className="mr-2" size={20} />
              Search Rooms
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindRoom;
