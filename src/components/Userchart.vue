<template>
<div class="user-container">
    <div class="div-1">
        <div class="one-div">
            <h1>{{ this.$route.params.user_id }}</h1>
            <button @click="back">Back</button>
        </div>

        <div class="div-2">
            <div class="two-div">
                Trade Chart
            </div>

            <div class="div-3">
                <div class="sym">
                    <h1>Symbols</h1>
                    <div class="three-div">

                        <div v-for="item in storedSymbols" :key="item.symbol">
                            <span>{{ item.symbol }}</span>
                        </div>
                    </div>
                </div>

                <div class="sym">
                    <h1>Donut-chart</h1>
                    <div class="four-div" style="flex: 1; background: #f9f9f9;">
                        <apexchart type="radialBar" height="230" :options="donutChartOptions" :series="donutChartSeries" />
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    mapGetters
} from 'vuex';

import VueApexCharts from 'vue3-apexcharts';

export default {
    name: 'USERCHART',

    components: {
        apexchart: VueApexCharts
    },
    data() {
        return {
            donutChartSeries: [],
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
                labels: ['Trades', 'Pending','Positions','Orders','Deals'],
            }
        }
    },

mounted() {
        console.log('Symbols:', this.symbols);

        // Save symbols to localStorage on mount
        if (this.symbols && this.symbols.length) {
            localStorage.setItem('user_symbols', JSON.stringify(this.symbols));
        }

        this.updateDonutChartSeries(10, 5, 3, 2, 1); 
    },

    computed: {
        ...mapGetters(['symbols']),

        // Use Vuex symbols or fallback to localStorage
        storedSymbols() {
            return this.symbols && this.symbols.length ?
                this.symbols :
                JSON.parse(localStorage.getItem('user_symbols')) || [];
        }
    },

    methods: {
        back() {
            this.$router.push('/dashboard');
        },

           
        updateDonutChartSeries(trades, pending,Positions,Orders,Deals) {
            this.donutChartSeries = [trades, pending, Positions, Orders, Deals];
        }
    },

};
</script>

<style>
.user-container {
    background-color: #f9fafb;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.div-1 {
    height: 87vh;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); 
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.one-div {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.one-div h1 {
    font-size: 22px;
    font-weight: bold;
    text-transform: uppercase;
    color: #2c3e50;
    margin: 0;
}

.one-div button {
    padding: 8px 16px;
    font-size: 14px;
    background-color: transparent;
    border: 1px solid #3498db;
    color: #3498db;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.one-div button:hover {
    background-color: #3498db;
    color: #ffffff;
}

.div-2 {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.two-div {
    flex: 2;
    min-width: 300px;
    height: 80vh;
    background-color: #f0f4f8;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #2e86c1;
    font-weight: 600;
    font-size: 20px;
    box-shadow: inset 0 0 0 1px #dce3ea;
}

.div-3 {
    flex: 1;
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.div-3 h1 {
    margin: 0;
    font-size: 18px;
    color: #34495e;
    padding-left: 4px;

}

.div-3 .sym {
    border: 5px solid #dce3ea;
    border-radius: 10px;
}

.three-div,
.four-div {
    background-color: #ffffff;
    border-radius: 10px;
    padding: 16px;
    height: 30vh;
    overflow-y: auto;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.three-div span {

    padding: 8px 12px;
    font-size: 16px;
    color: #2c3e50;
    width: 100%;

}
</style>
