import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

function MCQAnswer({ 
    options = [], 
    explanation = '', 
    onSubmit, 
    isSubmitting = false,
    showResult = false,
    selectedAnswer = null,
    isCorrect = false,
    onNext = null, // New prop for next button
    showNext = false, // New prop to show next button
    nextButtonText = "Next Question", // Customizable next button text
    onChange = null // New prop for handling selection changes
}) {
    const [selectedOption, setSelectedOption] = useState(selectedAnswer);

    // Sync with parent when selectedAnswer prop changes
    useEffect(() => {
        setSelectedOption(selectedAnswer);
    }, [selectedAnswer]);

    const handleOptionSelect = (index) => {
        if (!showResult) {
            setSelectedOption(index);
            // Notify parent component of the change
            if (onChange) {
                onChange(index);
            }
        }
    };

    const handleSubmit = () => {
        if (selectedOption !== null && onSubmit) {
            onSubmit(selectedOption);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Choose the correct answer:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrectOption = option.isCorrect;
                        
                        let cardClass = "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ";
                        
                        if (showResult) {
                            if (isCorrectOption) {
                                cardClass += "bg-green-50 border-green-200 dark:bg-green-950/20 ";
                            } else if (isSelected && !isCorrectOption) {
                                cardClass += "bg-red-50 border-red-200 dark:bg-red-950/20 ";
                            } else {
                                cardClass += "bg-background ";
                            }
                        } else {
                            if (isSelected) {
                                cardClass += "bg-primary/5 border-primary ";
                            } else {
                                cardClass += "bg-background hover:bg-muted/50 ";
                            }
                        }

                        return (
                            <div
                                key={index}
                                className={cardClass}
                                onClick={() => handleOptionSelect(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
                                    }`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="flex-1">{option.text}</span>
                                    {showResult && (
                                        <div className="flex items-center gap-2">
                                            {isCorrectOption && (
                                                <Badge variant="default" className="bg-green-600">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Correct
                                                </Badge>
                                            )}
                                            {isSelected && !isCorrectOption && (
                                                <Badge variant="destructive">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Your Answer
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {!showResult && (
                <div className="flex justify-center">
                    <Button 
                        onClick={handleSubmit}
                        disabled={selectedOption === null || isSubmitting}
                        className="px-8"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                </div>
            )}

            {showResult && explanation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{explanation}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Next Button - Show after submission */}
            {showResult && showNext && onNext && (
                <div className="flex justify-center">
                    <Button 
                        onClick={onNext}
                        className="px-8"
                        variant="default"
                    >
                        {nextButtonText}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default MCQAnswer;