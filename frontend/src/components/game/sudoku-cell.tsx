import { cn } from "@/lib/utils";

interface SudokuCellProps {
    value: number;
    isInitial: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    onClick: () => void;
    rowIndex: number;
    colIndex: number;
}

export default function SudokuCell({
    value,
    isInitial,
    isSelected,
    isHighlighted,
    onClick,
    rowIndex,
    colIndex,
}: SudokuCellProps) {
    // Determine if this cell is on a box boundary
    const isBoxBoundaryRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
    const isBoxBoundaryBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;

    return (
        <div
            className={cn(
                "w-9 h-9 md:w-12 md:h-12 flex items-center justify-center font-medium text-lg cursor-pointer transition-colors border border-border",
                isInitial
                    ? "bg-muted font-bold"
                    : isSelected
                        ? "bg-primary/20"
                        : isHighlighted
                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                            : "hover:bg-accent",
                isBoxBoundaryRight && "border-r-2 border-r-primary",
                isBoxBoundaryBottom && "border-b-2 border-b-primary"
            )}
            onClick={onClick}
        >
            {value > 0 ? value : ""}
        </div>
    );
}