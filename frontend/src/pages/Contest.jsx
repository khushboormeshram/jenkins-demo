import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { contestService } from "@/services/contest.service";
import { useAuth } from "@/context/AuthContext";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

function ContestCard({ id, title, subtitle }) {
    const navigate = useNavigate();
    
    const handleViewChallenges = () => {
        if (id) {
            // Navigate to contest details page
            navigate(`/contest/${id}`);
        } else {
            // For previous contests without ID, show a message
            alert('This contest has ended. Challenge details are no longer available.');
        }
    };

    return (
        <Card
            className="border bg-gray-50 text-gray-900 border-gray-200 dark:bg-[var(--contest-card-bg)] dark:border-[#2a2b35] dark:text-white"
        >
            <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={handleViewChallenges}>
                    View Challenges
                </Button>
            </CardFooter>
        </Card>
    );
}

function ActiveContestCard({ id, title, description, actionLabel, img }) {
    return (
        <Link to={`/contest/${id}`} className="block h-full">
            <div className="relative h-full rounded-xl border-[0.75px] border-border p-0">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <Card
                    className="relative border-0 bg-background text-foreground w-full h-full pt-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col rounded-xl shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]"
                >
                    <CardContent className="px-0">
                        <img
                            src={img}
                            alt={title}
                            className="aspect-video h-40 sm:h-48 w-full object-cover rounded-t-xl"
                        />
                    </CardContent>
                    <CardHeader className="pb-2 flex-1">
                        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-300">{description}</CardDescription>
                    </CardHeader>
                    {/* <CardFooter className="gap-3 py-4 pt-0">
                        <Button variant="outline" className="w-full md:w-auto">{actionLabel}</Button>
                    </CardFooter> */}
                </Card>
            </div>
        </Link>
    );
}

function ContestPage() {
    const { isTeacher, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [activeContests, setActiveContests] = useState([]);
    const [previousContests, setPreviousContests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch contests from backend
    useEffect(() => {
        const fetchContests = async () => {
            try {
                setLoading(true);
                const response = await contestService.getContests({
                    page: currentPage,
                    limit: itemsPerPage
                });

                if (response.success) {
                    const active = response.data.contests.filter(c => c.status === 'active' || c.status === 'upcoming');
                    const ended = response.data.contests.filter(c => c.status === 'ended');
                    setActiveContests(active);
                    setPreviousContests(ended);
                }
            } catch (error) {
                console.error('Failed to fetch contests:', error);
                // Fallback to sample data
                setActiveContests([
                    { _id: "1", title: "Astra Arena", description: "A weekly coding contest to test your skills.", bannerImage: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto" },
                    { _id: "2", title: "Cosmos Clash", description: "Monthly challenge with advanced algorithmic problems.", bannerImage: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png" },
                    { _id: "3", title: "Stellar Sprint", description: "Monthly challenge with advanced algorithmic problems.", bannerImage: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto" },
                ]);
                setPreviousContests([
                    { title: "Weekly Contest 475", subtitle: "Event ended on Nov 9, 2025" },
                    { title: "Weekly Contest 474", subtitle: "Event ended on Nov 2, 2025" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [currentPage]);

    const totalPages = Math.ceil(previousContests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentContests = previousContests.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleManageContests = () => {
        // Navigate to teacher dashboard contests section
        navigate('/teacher/dashboard?tab=contests');
    };

    const handleCreateContest = () => {
        // Navigate to teacher dashboard contests section with create form open
        navigate('/teacher/dashboard?tab=contests&action=create');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 dark:bg-background dark:text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        {/* <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                     <BreadcrumbPage>All Contests</BreadcrumbPage> 
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb> */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">Contests</h1>
                    </div>
                    {(isTeacher || isAdmin) && (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                className="flex-1 sm:flex-none text-sm"
                                onClick={handleManageContests}
                            >
                                Manage
                            </Button>
                            <Button 
                                className="flex-1 sm:flex-none text-sm"
                                onClick={handleCreateContest}
                            >
                                Create Contest
                            </Button>
                        </div>
                    )}
                </div >

                <div className="mt-6 sm:mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold">Active Contests</h2>
                    {loading ? (
                        <div className="mt-4 text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading contests...</p>
                        </div>
                    ) : activeContests.length > 0 ? (
                        <div className="mt-4 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7 items-stretch">
                            {activeContests.map((contest) => (
                                <ActiveContestCard
                                    key={contest._id}
                                    id={contest._id}
                                    title={contest.title}
                                    description={contest.description}
                                    actionLabel="Sign Up"
                                    img={contest.bannerImage || "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7 items-stretch">
                            <ActiveContestCard
                                id="1"
                                title="Astra Arena"
                                description="A weekly coding contest to test your skills."
                                actionLabel="Sign Up"
                                img="https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"
                            />
                            <ActiveContestCard
                                id="2"
                                title="Cosmos Clash"
                                description="Monthly challenge with advanced algorithmic problems."
                                actionLabel="View Details"
                                img="https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"
                            />

                            <ActiveContestCard
                                id="3"
                                title="Stellar Sprint"
                                description="Monthly challenge with advanced algorithmic problems."
                                actionLabel="View Details"
                                img="https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-8 sm:mt-10">
                    <h2 className="text-lg sm:text-xl font-semibold">Previous Contests</h2>
                    <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {currentContests.map((contest, index) => (
                            <ContestCard
                                key={`${contest.title}-${startIndex + index}`}
                                id={contest._id || contest.id}
                                title={contest.title}
                                subtitle={contest.subtitle}
                            />
                        ))}
                    </div>

                    <Pagination className="mt-6 sm:mt-8">
                        <PaginationContent className="flex-wrap">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div >
        </div >
    );
}

export default ContestPage;