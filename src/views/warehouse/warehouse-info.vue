<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <a-breadcrumb>
      <a-breadcrumb-item>仓库管理</a-breadcrumb-item>
      <a-breadcrumb-item>仓库信息</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 仓库数据概览卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in warehouseCards" :key="index">
        <div class="data-card">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-compare" v-if="card.compare">
              <span :class="{'up': card.trend > 0, 'down': card.trend < 0}">
                {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
              </span>
              <span class="compare-text">较上月</span>
            </div>
          </div>
          <div class="card-icon" :style="{ backgroundColor: `${card.color}1a`, color: card.color }">
            <component :is="card.icon" :style="{ fontSize: '28px' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 仓库信息和库位状态 -->
    <a-row :gutter="[16, 16]">
      <!-- 仓库基本信息 -->
      <a-col :span="12">
        <a-card class="general-card" title="仓库基本信息">
          <template #extra>
            <a-button type="text" size="small" @click="handleEdit">
              <template #icon><icon-edit /></template>
              编辑信息
            </a-button>
          </template>
          <a-descriptions
            :data="warehouseInfo"
            :column="1"
            layout="inline-vertical"
            bordered
            size="large"
            class="info-description"
          />
        </a-card>
      </a-col>
      
      <!-- 库位状态 -->
      <a-col :span="12">
        <a-card class="general-card" title="库位状态概览">
          <template #extra>
            <a-space>
              <a-button size="small" type="primary" @click="refreshLocationStatus">
                <template #icon><icon-refresh /></template>
                刷新数据
              </a-button>
            </a-space>
          </template>
          <div class="location-status-view">
            <div class="status-chart-placeholder">
              <div class="chart-notice">
                <icon-storage style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                <div>此区域将展示库位状态图表</div>
                <div class="chart-desc">包含不同区域和库位的使用情况</div>
              </div>
            </div>
            <div class="status-legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #165DFF"></span>
                <span class="legend-name">已使用</span>
                <span class="legend-value">164个</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #00B42A"></span>
                <span class="legend-name">可用</span>
                <span class="legend-value">86个</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #F7BA1E"></span>
                <span class="legend-name">维护中</span>
                <span class="legend-value">14个</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #F53F3F"></span>
                <span class="legend-name">异常</span>
                <span class="legend-value">4个</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 库区和库位列表 -->
    <a-card class="general-card" title="库区与库位管理" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAddArea">
            <template #icon><icon-plus /></template>
            新增库区
          </a-button>
          <a-button @click="handleAddLocation">
            <template #icon><icon-plus /></template>
            新增库位
          </a-button>
        </a-space>
      </template>
      <a-table 
        :columns="locationColumns" 
        :data="locationData" 
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      />
    </a-card>

    <!-- 仓库列表 -->
    <a-card class="general-card" title="仓库列表">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showTransferModal = true">
            <template #icon><icon-swap /></template>
            库存调拨
          </a-button>
          <a-button type="primary" @click="showBatchModal = true">
            <template #icon><icon-tag /></template>
            批次管理
          </a-button>
          <a-button type="primary" @click="showCostModal = true">
            <template #icon><icon-apps /></template>
            成本核算
          </a-button>
          <a-button type="primary" @click="showTurnoverModal = true">
            <template #icon><icon-refresh /></template>
            周转率分析
          </a-button>
        </a-space>
      </template>
      <a-table 
        :columns="locationColumns" 
        :data="locationData" 
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      />
    </a-card>

    <!-- 编辑仓库信息对话框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑仓库信息"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      :ok-loading="submitLoading"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="name" label="仓库名称">
          <a-input v-model="editForm.name" placeholder="请输入仓库名称" />
        </a-form-item>
        <a-form-item field="code" label="仓库编码">
          <a-input v-model="editForm.code" placeholder="请输入仓库编码" />
        </a-form-item>
        <a-form-item field="address" label="仓库地址">
          <a-input v-model="editForm.address" placeholder="请输入仓库地址" />
        </a-form-item>
        <a-form-item field="manager" label="负责人">
          <a-input v-model="editForm.manager" placeholder="请输入负责人姓名" />
        </a-form-item>
        <a-form-item field="phone" label="联系电话">
          <a-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item field="remark" label="备注信息">
          <a-textarea v-model="editForm.remark" placeholder="请输入备注信息" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 库存调拨弹窗 -->
    <a-modal
      v-model:visible="showTransferModal"
      title="库存调拨"
      @ok="handleTransferSubmit"
      @cancel="showTransferModal = false"
      :width="800"
    >
      <a-form :model="transferForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="fromWarehouse" label="调出仓库" required>
              <a-select v-model="transferForm.fromWarehouse" placeholder="请选择调出仓库">
                <a-option v-for="warehouse in warehouseList" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="toWarehouse" label="调入仓库" required>
              <a-select v-model="transferForm.toWarehouse" placeholder="请选择调入仓库">
                <a-option v-for="warehouse in warehouseList" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="items" label="调拨商品" required>
          <a-table :data="transferForm.items" :pagination="false">
            <template #columns>
              <a-table-column title="商品编码" data-index="code" />
              <a-table-column title="商品名称" data-index="name" />
              <a-table-column title="当前库存" data-index="currentStock" />
              <a-table-column title="调拨数量" data-index="quantity">
                <template #cell="{ record }">
                  <a-input-number v-model="record.quantity" :min="1" :max="record.currentStock" />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80">
                <template #cell="{ rowIndex }">
                  <a-button type="text" status="danger" @click="removeTransferItem(rowIndex)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-button type="dashed" long @click="addTransferItem">
            <template #icon><icon-plus /></template>
            添加商品
          </a-button>
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="transferForm.remark" placeholder="请输入备注信息" />
        </a-form-item>
        <a-form-item field="approver" label="审批人" required>
          <a-select v-model="transferForm.approver" placeholder="请选择审批人">
            <a-option v-for="user in approverList" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.role }})
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 调拨记录列表 -->
    <a-card class="general-card" title="调拨记录" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-select
            v-model="transferStatusFilter"
            placeholder="调拨状态"
            style="width: 120px"
            allow-clear
          >
            <a-option value="pending">待审批</a-option>
            <a-option value="approved">已审批</a-option>
            <a-option value="rejected">已拒绝</a-option>
            <a-option value="completed">已完成</a-option>
          </a-select>
          <a-button type="primary" @click="showTransferModal = true">
            <template #icon><icon-plus /></template>
            新增调拨
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="transferRecords"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="调拨单号" data-index="transferNo" />
          <a-table-column title="调出仓库" data-index="fromWarehouse" />
          <a-table-column title="调入仓库" data-index="toWarehouse" />
          <a-table-column title="调拨数量" data-index="totalQuantity" />
          <a-table-column title="申请人" data-index="applicant" />
          <a-table-column title="申请时间" data-index="applyTime" />
          <a-table-column title="审批人" data-index="approver" />
          <a-table-column title="审批时间" data-index="approveTime" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getTransferStatusColor(record.status)">
                {{ getTransferStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewTransferDetail(record)">
                  查看
                </a-button>
                <a-button 
                  v-if="record.status === 'pending'"
                  type="text" 
                  status="success" 
                  size="small"
                  @click="approveTransfer(record)"
                >
                  审批
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 批次管理弹窗 -->
    <a-modal
      v-model:visible="showBatchModal"
      title="批次管理"
      @ok="handleBatchSubmit"
      @cancel="showBatchModal = false"
      :width="800"
    >
      <a-form :model="batchForm" layout="vertical">
        <a-form-item field="warehouse" label="选择仓库" required>
          <a-select v-model="batchForm.warehouse" placeholder="请选择仓库">
            <a-option v-for="warehouse in warehouseList" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="product" label="选择商品" required>
          <a-select v-model="batchForm.product" placeholder="请选择商品">
            <a-option v-for="product in productList" :key="product.id" :value="product.id">
              {{ product.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-table :data="batchForm.batches" :pagination="false">
          <template #columns>
            <a-table-column title="批次号" data-index="batchNo" />
            <a-table-column title="生产日期" data-index="productionDate">
              <template #cell="{ record }">
                <a-date-picker v-model="record.productionDate" />
              </template>
            </a-table-column>
            <a-table-column title="有效期" data-index="expiryDate">
              <template #cell="{ record }">
                <a-date-picker v-model="record.expiryDate" />
              </template>
            </a-table-column>
            <a-table-column title="库存数量" data-index="quantity" />
            <a-table-column title="状态" data-index="status">
              <template #cell="{ record }">
                <a-tag :color="getBatchStatusColor(record.status)">
                  {{ getBatchStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-form>
    </a-modal>

    <!-- 成本核算弹窗 -->
    <a-modal
      v-model:visible="showCostModal"
      title="成本核算"
      @ok="handleCostSubmit"
      @cancel="showCostModal = false"
      :width="800"
    >
      <a-form :model="costForm" layout="vertical">
        <a-form-item field="warehouse" label="选择仓库" required>
          <a-select v-model="costForm.warehouse" placeholder="请选择仓库">
            <a-option v-for="warehouse in warehouseList" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="统计时间" required>
          <a-range-picker v-model="costForm.dateRange" />
        </a-form-item>
        <a-table :data="costForm.costs" :pagination="false">
          <template #columns>
            <a-table-column title="商品编码" data-index="code" />
            <a-table-column title="商品名称" data-index="name" />
            <a-table-column title="期初库存" data-index="beginStock" />
            <a-table-column title="期初金额" data-index="beginAmount" />
            <a-table-column title="入库数量" data-index="inboundQuantity" />
            <a-table-column title="入库金额" data-index="inboundAmount" />
            <a-table-column title="出库数量" data-index="outboundQuantity" />
            <a-table-column title="出库金额" data-index="outboundAmount" />
            <a-table-column title="期末库存" data-index="endStock" />
            <a-table-column title="期末金额" data-index="endAmount" />
            <a-table-column title="平均成本" data-index="averageCost" />
          </template>
        </a-table>
      </a-form>
    </a-modal>

    <!-- 周转率分析弹窗 -->
    <a-modal
      v-model:visible="showTurnoverModal"
      title="周转率分析"
      @ok="handleTurnoverSubmit"
      @cancel="showTurnoverModal = false"
      :width="800"
    >
      <a-form :model="turnoverForm" layout="vertical">
        <a-form-item field="warehouse" label="选择仓库" required>
          <a-select v-model="turnoverForm.warehouse" placeholder="请选择仓库">
            <a-option v-for="warehouse in warehouseList" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="统计时间" required>
          <a-range-picker v-model="turnoverForm.dateRange" />
        </a-form-item>
        <a-table :data="turnoverForm.turnovers" :pagination="false">
          <template #columns>
            <a-table-column title="商品编码" data-index="code" />
            <a-table-column title="商品名称" data-index="name" />
            <a-table-column title="期初库存" data-index="beginStock" />
            <a-table-column title="期末库存" data-index="endStock" />
            <a-table-column title="平均库存" data-index="averageStock" />
            <a-table-column title="出库数量" data-index="outboundQuantity" />
            <a-table-column title="周转次数" data-index="turnoverTimes" />
            <a-table-column title="周转天数" data-index="turnoverDays" />
            <a-table-column title="周转率" data-index="turnoverRate">
              <template #cell="{ record }">
                <a-progress :percent="record.turnoverRate" :color="getTurnoverRateColor(record.turnoverRate)" />
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-form>
    </a-modal>

    <!-- 仓库管理卡片 -->
    <a-card class="general-card" title="仓库管理">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal = true">
            <template #icon><icon-plus /></template>
            新增仓库
          </a-button>
          <a-button type="primary" @click="showTransferModal = true">
            <template #icon><icon-swap /></template>
            库存调拨
          </a-button>
          <a-button type="primary" @click="showBatchModal = true">
            <template #icon><icon-tag /></template>
            批次管理
          </a-button>
          <a-button type="primary" @click="showCostModal = true">
            <template #icon><icon-apps /></template>
            成本核算
          </a-button>
          <a-button type="primary" @click="showTurnoverModal = true">
            <template #icon><icon-refresh /></template>
            周转率分析
          </a-button>
        </a-space>
      </template>

      <!-- 仓库信息表格 -->
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" title="仓库信息">
          <a-table 
            :columns="warehouseColumns" 
            :data="warehouseData" 
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            row-key="id"
            stripe
          >
            <template #operations="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="editWarehouse(record)">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="viewInventory(record)">
                  <template #icon><icon-storage /></template>
                  库存
                </a-button>
                <a-popconfirm
                  content="确定删除该仓库吗？"
                  position="br"
                  @ok="deleteWarehouse(record)"
                >
                  <a-button type="text" status="danger" size="small">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="2" title="库存信息">
          <a-table 
            :columns="inventoryColumns" 
            :data="inventoryData" 
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            row-key="id"
            stripe
          >
            <template #operations="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewBatch(record)">
                  <template #icon><icon-tag /></template>
                  批次
                </a-button>
                <a-button type="text" size="small" @click="viewHistory(record)">
                  <template #icon><icon-history /></template>
                  历史
                </a-button>
              </a-space>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, h, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconStorage, 
  IconArchive,
  IconLocation,
  IconUser,
  IconEdit,
  IconRefresh,
  IconPlus,
  IconSwap,
  IconTag,
  IconApps,
  IconDelete,
  IconHistory
} from '@arco-design/web-vue/es/icon';
import { markRaw } from 'vue';

// 仓库概览卡片数据
const warehouseCards = ref([
  {
    title: '总库位数',
    value: '268',
    icon: markRaw(IconStorage),
    color: '#165DFF'
  },
  {
    title: '库位利用率',
    value: '61.2%',
    icon: markRaw(IconArchive),
    color: '#37C2FF',
    trend: 5.2,
    compare: true
  },
  {
    title: '活跃库位',
    value: '142',
    icon: markRaw(IconLocation),
    color: '#00B42A',
    trend: 12.5,
    compare: true
  },
  {
    title: '今日操作',
    value: '24',
    icon: markRaw(IconUser),
    color: '#F7BA1E'
  }
]);

// 仓库基本信息
const warehouseInfo = [
  {
    label: '仓库名称',
    value: '中央配送仓库'
  },
  {
    label: '仓库编码',
    value: 'WH-CENTER-001'
  },
  {
    label: '仓库地址',
    value: '上海市浦东新区张江高科技园区科苑路88号'
  },
  {
    label: '仓库面积',
    value: '5,000平方米'
  },
  {
    label: '仓库负责人',
    value: '张经理'
  },
  {
    label: '联系电话',
    value: '13800138000'
  },
  {
    label: '创建时间',
    value: '2023-01-15'
  },
  {
    label: '备注信息',
    value: '公司主要仓库，负责全国配送中心的货物存储和分发。'
  }
];

// 仓库数据
const warehouseData = ref([
  {
    id: 1,
    code: 'WH-CENTER-001',
    name: '中央配送仓库',
    type: '配送中心',
    manager: '张经理',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路88号',
    status: 'active'
  },
  {
    id: 2,
    code: 'WH-NORTH-001',
    name: '北区仓库',
    type: '区域仓库',
    manager: '王经理',
    phone: '13900139000',
    address: '北京市朝阳区建国路88号',
    status: 'active'
  },
  {
    id: 3,
    code: 'WH-SOUTH-001',
    name: '南区仓库',
    type: '区域仓库',
    manager: '李经理',
    phone: '13700137000',
    address: '广州市天河区天河路100号',
    status: 'active'
  },
  {
    id: 4,
    code: 'WH-TEMP-001',
    name: '临时仓库',
    type: '临时仓库',
    manager: '赵经理',
    phone: '13600136000',
    address: '重庆市渝中区解放碑88号',
    status: 'inactive'
  }
]);

// 库存数据
const inventoryData = ref([
  {
    id: 1,
    productCode: 'P001',
    productName: '苹果手机',
    specification: '256GB 远峰蓝',
    currentStock: 120,
    safetyStock: 50,
    maxStock: 200,
    stockStatus: 'normal',
    warehouseId: 1
  },
  {
    id: 2,
    productCode: 'P002',
    productName: '安卓手机',
    specification: '128GB 曜石黑',
    currentStock: 85,
    safetyStock: 60,
    maxStock: 150,
    stockStatus: 'normal',
    warehouseId: 1
  },
  {
    id: 3,
    productCode: 'P003',
    productName: '平板电脑',
    specification: '64GB 银色',
    currentStock: 32,
    safetyStock: 30,
    maxStock: 80,
    stockStatus: 'warning',
    warehouseId: 1
  },
  {
    id: 4,
    productCode: 'P004',
    productName: '笔记本电脑',
    specification: '16GB/512GB 灰色',
    currentStock: 18,
    safetyStock: 20,
    maxStock: 50,
    stockStatus: 'critical',
    warehouseId: 1
  },
  {
    id: 5,
    productCode: 'P005',
    productName: '无线耳机',
    specification: '白色',
    currentStock: 210,
    safetyStock: 100,
    maxStock: 200,
    stockStatus: 'excess',
    warehouseId: 1
  }
]);

// 库位表格列定义
const locationColumns = [
  {
    title: '库区编码',
    dataIndex: 'areaCode',
  },
  {
    title: '库区名称',
    dataIndex: 'areaName',
  },
  {
    title: '库位编码',
    dataIndex: 'code',
  },
  {
    title: '库位类型',
    dataIndex: 'type',
  },
  {
    title: '存储容量',
    dataIndex: 'capacity',
    align: 'right',
  },
  {
    title: '当前状态',
    dataIndex: 'status',
    render: ({ record }) => {
      const statusMap = {
        active: { text: '已使用', color: 'blue' },
        available: { text: '可用', color: 'green' },
        maintenance: { text: '维护中', color: 'orange' },
        error: { text: '异常', color: 'red' }
      };
      const status = statusMap[record.status];
      
      return h('a-tag', { color: status.color }, status.text);
    }
  },
  {
    title: '操作',
    width: 120,
    render: () => {
      return h('div', { class: 'operations' }, [
        h('a-button', { type: 'text', size: 'small' }, '查看'),
        h('a-button', { type: 'text', size: 'small' }, '编辑')
      ]);
    }
  }
];

// 库位数据
const locationData = ref([
  {
    id: 1,
    areaCode: 'A',
    areaName: '普通货架区',
    code: 'A-01-01',
    type: '标准货架',
    capacity: '1000kg',
    status: 'active'
  },
  {
    id: 2,
    areaCode: 'A',
    areaName: '普通货架区',
    code: 'A-01-02',
    type: '标准货架',
    capacity: '1000kg',
    status: 'active'
  },
  {
    id: 3,
    areaCode: 'A',
    areaName: '普通货架区',
    code: 'A-01-03',
    type: '标准货架',
    capacity: '1000kg',
    status: 'available'
  },
  {
    id: 4,
    areaCode: 'B',
    areaName: '重型货物区',
    code: 'B-01-01',
    type: '重型货架',
    capacity: '2000kg',
    status: 'active'
  },
  {
    id: 5,
    areaCode: 'B',
    areaName: '重型货物区',
    code: 'B-01-02',
    type: '重型货架',
    capacity: '2000kg',
    status: 'maintenance'
  },
  {
    id: 6,
    areaCode: 'C',
    areaName: '易碎品区',
    code: 'C-01-01',
    type: '特殊货架',
    capacity: '500kg',
    status: 'active'
  },
  {
    id: 7,
    areaCode: 'C',
    areaName: '易碎品区',
    code: 'C-01-02',
    type: '特殊货架',
    capacity: '500kg',
    status: 'error'
  }
]);

// 编辑仓库信息相关
const editModalVisible = ref(false);
const submitLoading = ref(false);
const editForm = reactive({
  name: '中央配送仓库',
  code: 'WH-CENTER-001',
  address: '上海市浦东新区张江高科技园区科苑路88号',
  manager: '张经理',
  phone: '13800138000',
  remark: '公司主要仓库，负责全国配送中心的货物存储和分发。'
});

// 编辑仓库信息
const handleEdit = () => {
  editModalVisible.value = true;
};

// 提交编辑表单
const handleEditSubmit = () => {
  submitLoading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    submitLoading.value = false;
    editModalVisible.value = false;
    
    // 更新仓库信息
    warehouseInfo[0].value = editForm.name;
    warehouseInfo[1].value = editForm.code;
    warehouseInfo[2].value = editForm.address;
    warehouseInfo[4].value = editForm.manager;
    warehouseInfo[5].value = editForm.phone;
    warehouseInfo[7].value = editForm.remark;
    
    Message.success('仓库信息更新成功');
  }, 1000);
};

// 刷新库位状态
const refreshLocationStatus = () => {
  Message.success('库位状态已刷新');
};

// 新增库区
const handleAddArea = () => {
  Message.info('新增库区功能待实现');
};

// 新增库位
const handleAddLocation = () => {
  Message.info('新增库位功能待实现');
};

// 弹窗控制
const showTransferModal = ref(false);
const showBatchModal = ref(false);
const showCostModal = ref(false);
const showTurnoverModal = ref(false);

// 表单数据
const transferForm = ref({
  fromWarehouse: '',
  toWarehouse: '',
  items: [],
  remark: '',
  approver: ''
});

const batchForm = ref({
  warehouse: '',
  product: '',
  batches: []
});

const costForm = ref({
  warehouse: '',
  dateRange: [],
  costs: []
});

const turnoverForm = ref({
  warehouse: '',
  dateRange: [],
  turnovers: []
});

// 模拟数据
const warehouseList = ref([
  { id: 1, name: '主仓库' },
  { id: 2, name: '分仓1' },
  { id: 3, name: '分仓2' }
]);

const productList = ref([
  { id: 1, name: '商品A' },
  { id: 2, name: '商品B' },
  { id: 3, name: '商品C' }
]);

// 方法
const addTransferItem = () => {
  transferForm.value.items.push({
    code: '',
    name: '',
    currentStock: 0,
    quantity: 1
  });
};

const removeTransferItem = (index) => {
  transferForm.value.items.splice(index, 1);
};

const getBatchStatusColor = (status) => {
  const colors = {
    normal: 'green',
    warning: 'orange',
    expired: 'red'
  };
  return colors[status] || 'blue';
};

const getBatchStatusText = (status) => {
  const texts = {
    normal: '正常',
    warning: '即将过期',
    expired: '已过期'
  };
  return texts[status] || status;
};

const getTurnoverRateColor = (rate) => {
  if (rate >= 80) return 'rgb(var(--success-6))';
  if (rate >= 60) return 'rgb(var(--warning-6))';
  return 'rgb(var(--danger-6))';
};

// 提交处理
const handleTransferSubmit = () => {
  // 处理调拨提交
  console.log('调拨数据：', transferForm.value);
  showTransferModal.value = false;
};

const handleBatchSubmit = () => {
  // 处理批次提交
  console.log('批次数据：', batchForm.value);
  showBatchModal.value = false;
};

const handleCostSubmit = () => {
  // 处理成本核算提交
  console.log('成本数据：', costForm.value);
  showCostModal.value = false;
};

const handleTurnoverSubmit = () => {
  // 处理周转率分析提交
  console.log('周转率数据：', turnoverForm.value);
  showTurnoverModal.value = false;
};

// 仓库信息表格列定义
const warehouseColumns = [
  {
    title: '仓库编码',
    dataIndex: 'code',
    width: 120
  },
  {
    title: '仓库名称',
    dataIndex: 'name',
    width: 150
  },
  {
    title: '仓库类型',
    dataIndex: 'type',
    width: 120
  },
  {
    title: '负责人',
    dataIndex: 'manager',
    width: 100
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    width: 120
  },
  {
    title: '地址',
    dataIndex: 'address'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }) => {
      const statusMap = {
        active: { text: '正常', color: 'green' },
        inactive: { text: '停用', color: 'red' },
        maintenance: { text: '维护中', color: 'orange' }
      };
      const status = statusMap[record.status];
      return h('a-tag', { color: status.color }, status.text);
    }
  },
  {
    title: '操作',
    width: 200,
    slotName: 'operations'
  }
];

// 库存信息表格列定义
const inventoryColumns = [
  {
    title: '商品编码',
    dataIndex: 'productCode',
    width: 120
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    width: 120
  },
  {
    title: '当前库存',
    dataIndex: 'currentStock',
    width: 100
  },
  {
    title: '安全库存',
    dataIndex: 'safetyStock',
    width: 100
  },
  {
    title: '最大库存',
    dataIndex: 'maxStock',
    width: 100
  },
  {
    title: '库存状态',
    dataIndex: 'stockStatus',
    width: 100,
    render: ({ record }) => {
      const statusMap = {
        normal: { text: '正常', color: 'green' },
        warning: { text: '预警', color: 'orange' },
        critical: { text: '紧缺', color: 'red' },
        excess: { text: '过剩', color: 'blue' }
      };
      const status = statusMap[record.stockStatus];
      return h('a-tag', { color: status.color }, status.text);
    }
  },
  {
    title: '操作',
    width: 150,
    slotName: 'operations'
  }
];

// 方法
const viewInventory = (warehouse) => {
  // 切换到库存信息标签页
  activeTab.value = '2';
  // 加载该仓库的库存数据
  loadInventoryData(warehouse.id);
};

const viewBatch = (product) => {
  batchForm.value.warehouse = product.warehouseId;
  batchForm.value.product = product.id;
  showBatchModal.value = true;
};

const viewHistory = (product) => {
  // 显示库存历史记录
  Message.info('库存历史记录功能待实现');
};

const loadInventoryData = (warehouseId) => {
  // 加载库存数据
  inventoryData.value = [
    {
      id: 1,
      productCode: 'P001',
      productName: '商品A',
      specification: '规格1',
      currentStock: 100,
      safetyStock: 50,
      maxStock: 200,
      stockStatus: 'normal',
      warehouseId: warehouseId
    },
    // ... 更多数据
  ];
};

// 监听标签页切换
const activeTab = ref('1');
watch(activeTab, (newVal) => {
  if (newVal === '2') {
    // 切换到库存信息标签页时加载数据
    loadInventoryData(warehouseData.value[0]?.id);
  }
});

// 调拨相关数据
const transferStatusFilter = ref('');
const transferRecords = ref([
  {
    id: 1,
    transferNo: 'TR20240301001',
    fromWarehouse: '主仓库',
    toWarehouse: '分仓1',
    totalQuantity: 100,
    applicant: '张三',
    applyTime: '2024-03-01 10:00:00',
    approver: '李四',
    approveTime: '2024-03-01 11:00:00',
    status: 'completed'
  },
  {
    id: 2,
    transferNo: 'TR20240301002',
    fromWarehouse: '分仓2',
    toWarehouse: '主仓库',
    totalQuantity: 50,
    applicant: '王五',
    applyTime: '2024-03-01 14:00:00',
    approver: '',
    approveTime: '',
    status: 'pending'
  }
]);

const approverList = ref([
  { id: 1, name: '李四', role: '仓库主管' },
  { id: 2, name: '赵六', role: '库存主管' }
]);

// 获取调拨状态颜色
const getTransferStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'blue',
    rejected: 'red',
    completed: 'green'
  };
  return colors[status] || 'gray';
};

// 获取调拨状态文本
const getTransferStatusText = (status) => {
  const texts = {
    pending: '待审批',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return texts[status] || status;
};

// 查看调拨详情
const viewTransferDetail = (record) => {
  // 实现查看详情逻辑
  Message.info('查看调拨详情');
};

// 审批调拨
const approveTransfer = (record) => {
  // 实现审批逻辑
  Message.success('调拨审批成功');
};
</script>

<style scoped>
.container {
  padding: 20px;
}

.data-card {
  height: 104px;
  display: flex;
  padding: 20px 24px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 8px;
}

.card-compare {
  font-size: 12px;
  color: var(--color-text-3);
}

.card-compare .up {
  color: #00b42a;
}

.card-compare .down {
  color: #f53f3f;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  margin-left: 16px;
  font-size: 24px;
}

.compare-text {
  margin-left: 8px;
}

.general-card {
  margin-bottom: 16px;
  height: 100%;
}

.general-card :deep(.arco-card-header) {
  border-bottom: 1px solid var(--color-border);
}

.info-description {
  margin-top: 16px;
}

.location-status-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.status-chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-fill-2);
  border-radius: 4px;
  margin-bottom: 16px;
}

.chart-notice {
  text-align: center;
  color: var(--color-text-3);
}

.chart-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-4);
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.legend-name {
  font-size: 12px;
  color: var(--color-text-2);
  margin-right: 8px;
}

.legend-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-1);
}

.operations {
  display: flex;
  gap: 8px;
}

:deep(.arco-modal-footer .arco-btn),
:deep(.modal-footer .arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 