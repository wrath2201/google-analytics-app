import { ExternalLink, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type PropertyCardProps = {
    propertyId: string;
    propertyName?: string;
    isActive?: boolean;
    onRemove?: (propertyId: string) => void;
};

export default function PropertyCard({
    propertyId,
    propertyName,
    isActive = false,
    onRemove,
}: PropertyCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 flex items-center justify-between card-hover">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EDE8E0] flex items-center justify-center">
                    <ExternalLink size={16} className="text-[#C4956A]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-[#1A1814]">
                        {propertyName || propertyId}
                    </p>
                    {propertyName && (
                        <p className="text-xs text-[#8C8578] mt-0.5">{propertyId}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Badge variant={isActive ? "success" : "default"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(propertyId)}
                    >
                        <Trash2 size={14} className="text-[#8C8578]" />
                    </Button>
                )}
            </div>
        </div>
    );
}
