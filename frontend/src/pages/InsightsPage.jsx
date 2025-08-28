import React, { useState, useEffect, useMemo } from 'react';
import ApplicationService from '../services/application.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const InsightsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ApplicationService.getApplications()
            .then(response => {
                setApplications(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching applications:", error);
                setLoading(false);
            });
    }, []);

    const stats = useMemo(() => {
        if (applications.length === 0) {
            return { total: 0, active: 0, offers: 0, rejections: 0, statusData: {}, jobTypeData: {} };
        }

        const statusCounts = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});
        
        const jobTypeCounts = applications.reduce((acc, app) => {
            acc[app.jobType] = (acc[app.jobType] || 0) + 1;
            return acc;
        }, {});

        return {
            total: applications.length,
            active: (statusCounts['Applied'] || 0) + (statusCounts['Screening'] || 0) + (statusCounts['Interviewing'] || 0),
            offers: statusCounts['Offer'] || 0,
            rejections: statusCounts['Rejected'] || 0,
            statusData: {
                labels: Object.keys(statusCounts),
                data: Object.values(statusCounts),
            },
            jobTypeData: {
                labels: Object.keys(jobTypeCounts),
                data: Object.values(jobTypeCounts),
            }
        };
    }, [applications]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Applications by Status' },
        },
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Applications by Job Type' },
        },
    };

    const chartData = {
        labels: stats.statusData.labels,
        datasets: [{
            label: '# of Applications',
            data: stats.statusData.data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }],
    };
    
    const pieData = {
        labels: stats.jobTypeData.labels,
        datasets: [{
            data: stats.jobTypeData.data,
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        }],
    };

    if (loading) return <p>Loading insights...</p>;

    return (
        <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Application Insights</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 font-semibold">Total Applications</h3>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 font-semibold">Active Applications</h3>
                    <p className="text-4xl font-bold mt-2 text-blue-600">{stats.active}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 font-semibold">Offers Received</h3>
                    <p className="text-4xl font-bold mt-2 text-green-600">{stats.offers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 font-semibold">Rejections</h3>
                    <p className="text-4xl font-bold mt-2 text-red-600">{stats.rejections}</p>
                </div>
            </div>

            {/* Charts */}
            {applications.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <Bar options={chartOptions} data={chartData} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <Pie data={pieData} options={pieChartOptions} />
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-lg shadow-lg text-center">
                    <p className="text-gray-500">No application data to display. Add some applications to see your stats!</p>
                </div>
            )}
        </div>
    );
};

export default InsightsPage;