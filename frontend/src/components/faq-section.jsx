'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon } from 'lucide-react/dynamic'
import { Link } from 'react-router-dom'

export default function FAQsSection() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is Code-E-Pariksha?',
            answer: 'Code-E-Pariksha is an online platform where you can practice coding problems, take coding tests, and evaluate your skills instantly.',
        },
        {
            id: 'item-2',
            question: 'Do I need an account to use the platform?',
            answer: 'You can solve some problems without signing up, but creating an account lets you track progress, save submissions, and participate in tests or contests.',
        },
        {
            id: 'item-3',
            question: 'How are coding answers evaluated?',
            answer: 'Your code is executed against multiple test cases. If it passes all required inputs, your solution is marked correct with detailed results.',
        },
        {
            id: 'item-4',
            question: 'What languages can I code in?',
            answer: 'The platform supports common languages including C++, Java, Python, and JavaScript.',
        },
        {
            id: 'item-7',
            question: 'Can I take timed tests or contests?',
            answer: 'Yes, you can participate in timed assessments or contests with automatic ranking and scoring.',
        },
        {
            id: 'item-10',
            question: 'Can teachers or organizations use Code-E-Pariksha?',
            answer: 'Yes, teachers or institutes can create custom tests, invite students, and view performance analytics.',
        }
    ];



    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    customer support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}