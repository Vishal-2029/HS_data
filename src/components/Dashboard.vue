<template>
<div class="main-container wrapper">
    <Loader v-if="isLoading" />

    <!-- Accounts Section -->
    <div class="account-container">
        <h1>Accounts</h1>
        <div v-if="accounts.length > 0">
            <div v-for="account in accounts" :key="account.id" class="account-item" :class="{ selected: selectedAccountId === account.id }" @click="showDetails(account)">
                <div>{{ account.user_id }}</div>
                <transition name="fade">
                    <div v-if="selectedAccountId === account.id" class="account-details">
                        <div>Balance: {{ formatCurrency(detailObj.balance) }}</div>
                        <div>Profit: {{ formatCurrency(detailObj.profit) }}</div>
                    </div>
                </transition>
            </div>
        </div>
        <p v-else>No accounts found.</p>
    </div>

    <!-- Order Details Section -->
    <transition name="slide-fade">
        <div class="object-detail">
            <div class="object-detail-header">
                <h2>Order Details</h2>
                <button @click="logout">LogOut</button>
            </div>
            <br />
            <div class="list-group">
                <div class="total-orders-item">
                    <h3>Total Orders Positions</h3>
                    <p>{{ detailObj.positions?.length || 0 }}</p>
                </div>

                <div class="total-orders-item">
                    <h3>Total Orders</h3>
                    <p>{{ detailObj.orders?.length || 0 }}</p>
                </div>

                <div class="balance-item">
                    <h3>Balance</h3>
                    <p>{{ formatCurrency(detailObj.balance) }}</p>
                </div>

                <div class="profit-item">
                    <h3>Total Profit</h3>
                    <p>{{ formatCurrency(detailObj.profit) }}</p>
                </div>
            </div>

            <!-- Chart Section -->
            <div class="charts">

                <div class="line-chart" style="flex: 2">
                    <h3>Positions, Orders, and Deals Trend</h3>
                    <apexchart type="line" height="350" :options="chartOptions" :series="series" />
                </div>

                <div class="donut-chart" style="flex: 1; background: #f9f9f9; border-radius: 10px; padding: 10px;">
                    <h3>Trade & Pending Order</h3>
                    <apexchart type="radialBar" height="350" :options="donutChartOptions" :series="donutChartSeries" />
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import axios from 'axios';
import VueApexCharts from 'vue3-apexcharts';
import Loader from './Loader.vue';

export default {
    name: 'DASHBOARD',
    components: {
        apexchart: VueApexCharts,
        Loader,
    },
    data() {
        return {
            accounts: [],
            detailObj: [],
            donutChartSeries: [],
            selectedAccountId: null,

            // Line Chart Options 
            chartOptions: {
                chart: {
                    type: 'line',
                    height: 350,
                },

                stroke: {
                    curve: 'smooth',
                    width: 2,
                },
                markers: {
                    size: 4,
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'dd MMM',
                    },
                    tickAmount: 7,
                },
                yaxis: {
                    title: {
                        text: 'Count',
                    },
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy HH:mm',
                    },
                    y: {
                        formatter: function (val) {
                            return val;
                        },
                    },
                },
            },
            series: [{
                    name: 'Positions',
                    data: [],
                },
                {
                    name: 'Orders',
                    data: [],
                },
                {
                    name: 'Deals',
                    data: [],
                },
            ],

            // Donut Chart Options
            donutChartOptions: {
                chart: {
                    height: 350,
                    type: 'radialBar',
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: '22px',
                            },
                            value: {
                                fontSize: '16px',
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function (val) {
                                    return val;
                                },
                            },
                        },
                    },
                },
                labels: ['Trades', 'Pending'],
            },
            isLoading: false,
        };
    },

    methods: {

        // Accounts section
        async fetchAccounts() {
            this.isLoading = true;
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) {
                    console.error('No token found. Please log in.');
                    return;
                }

                const response = await axios.get('https://dev.hstrader.com/api/v1/accounts', {
                    headers: {
                        Authorization: `Bearer ${tokenString}`,
                    },
                });

                this.accounts = response.data.data;
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
            this.isLoading = false;
        },

        async showDetails(account) {
            this.selectedAccountId = account.id;
            this.detailObj = {
                account,
                balance: account.balance,
                profit: 0,
                orders: [],
                positions: [],
                deals: [],
            };
            await this.fetchOrdersAndPositions(account.id);
        },

        logout() {
            localStorage.removeItem('token');
            this.$router.push('/');
        },

        // Orders,Positions and Deals section
        async fetchOrdersAndPositions(accountId) {
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) {
                    console.error('No token found. Please log in.');
                    return;
                }

                // this.isLoading = true;
                const [
                    responsePosition,
                    responseOrder,
                    responseDeals,
                    responseTrades,
                    responsePending,
                ] = await Promise.all([
                    axios.get(`https://dev.hstrader.com/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/deals/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 0,
                            limit: 0,
                            active: 'true',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'true',
                        },
                    }),
                ]);
                // this.isLoading = false;

                // Extract values from response
                const trades = responseTrades.data.data.length;
                const pending = responsePending.data.data.length;
                const positions = responsePosition.data.data;
                const orders = responseOrder.data.data;
                const deals = responseDeals.data.data;

                // console Values
                console.log('Positions:', positions);
                console.log('Orders:', orders);
                console.log('Deals:', deals);
                console.log('Trades:', trades);
                console.log('Pending:', pending);

                // Total profit calculation
                let totalProfit = 0;
                positions.forEach((position) => {
                    totalProfit += Number(position.profit || 0);
                });

                this.detailObj.positions = positions;
                this.detailObj.orders = orders;
                this.detailObj.deals = deals;
                this.detailObj.profit = totalProfit;

                // Update the donut chart series
                this.donutChartSeries = [trades, pending];

                this.updateChart();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        //line chart Update
        updateChart() {
            const groupByDay = (items) => {
                const grouped = {};
                items.forEach((item) => {
                    const ms = item.created_at / 1_000_000;
                    const dateStr = new Date(ms).toISOString().split('T')[0]; // only YYYY-MM-DD
                    if (!grouped[dateStr]) {
                        grouped[dateStr] = 0;
                    }
                    grouped[dateStr] += 1;
                });
                return Object.keys(grouped).map((date) => ({
                    x: new Date(date).getTime(),
                    y: grouped[date],
                }));
            };

            const positionSeries = groupByDay(this.detailObj.positions);
            const orderSeries = groupByDay(this.detailObj.orders);
            const dealSeries = groupByDay(this.detailObj.deals);

            this.series = [{
                    name: 'Positions',
                    data: positionSeries,
                },
                {
                    name: 'Orders',
                    data: orderSeries,
                },
                {
                    name: 'Deals',
                    data: dealSeries,
                },
            ];
        },

        formatCurrency(value) {
            if (!value) return '$0.00';
            return `$ ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
        },
    },
    mounted() {
        this.fetchAccounts();
    },
};
</script>

<style scoped>
/* main-container Style */
.main-container {
    display: flex;
    background: #ffffff;
    padding: 20px;
}

/* Account Section Style */
.account-container {
    width: 300px;
    height: 87vh;
    overflow-y: auto;
    border-radius: 8px;
    border: 4px solid #ddd;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.account-item {
    padding: 10px;
    margin-bottom: 8px;
    background-color: #f2f2f2;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.account-item.selected {
    outline: 2px solid #007bff;
    background-color: #e6f0ff;
}

.account-details {
    margin-top: 5px;
    padding-left: 10px;
    font-size: 14px;
    color: #444;
}

/* object Section Style */
.object-detail {
    margin-left: 20px;
    padding: 20px;
    border-radius: 8px;
    border: 4px solid #ddd;
    background: #fff;
    flex: 1;
}

.object-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

}

.object-detail-header h2 {
    margin: 0;
    color: #333;
    font-size: 20px;
}

.object-detail-header button {
    padding: 5px 10px;
    width: 100px;
    background-color: transparent;
    color: #000;
    border: 1px solid #007bff;
    border-radius: 5px;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.object-detail-header button:hover {
    background-color: #f6f6f6;
}

.list-group {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.total-orders-item,
.balance-item,
.profit-item {
    padding: 15px;
    background-color: #f0f8ff;
    border-radius: 8px;
    flex: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-orders-item h3,
.balance-item h3,
.profit-item h3 {
    margin-bottom: 10px;
    color: #333;
}

/* Chart Section Style*/
.charts {
    display: flex;
    gap: 20px;
}

.line-chart {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
}

.donut-chart {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Animation */
.slide-fade-enter-active {
    transition: all 0.5s ease;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .main-container {
        flex-direction: column;
        padding: 10px;
    }

    .account-container {
        width: 100%;
        height: 70vh;
        margin-bottom: 20px;
        overflow-y: auto;
    }

    .object-detail {
        margin-left: 0;
        width: 100%;
    }

    .list-group {
        flex-direction: column;
    }

    .charts {
        flex-direction: column;
    }

    .line-chart,
    .donut-chart {
        width: 100%;
    }

    .object-detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

@media (max-width: 600px) {
    .account-container{
        height: 70vh;
        width: 100%;
        overflow-y: auto;
    }

    .account-item {
        font-size: 14px;
    }

    .account-details {
        font-size: 12px;
    }

    .total-orders-item h3,
    .balance-item h3,
    .profit-item h3 {
        font-size: 16px;
    }

    .object-detail-header h2 {
        font-size: 18px;
    }
}
</style>
