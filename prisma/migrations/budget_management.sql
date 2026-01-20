-- Budget Management System Migration
-- Phase 13: Budget Management

-- 1. Budget Period Table
CREATE TABLE IF NOT EXISTS budget_period (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED') DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    UNIQUE KEY unique_period (year, period_name),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Unit Budget Table
CREATE TABLE IF NOT EXISTS unit_budget (
    id INT PRIMARY KEY AUTO_INCREMENT,
    period_id INT NOT NULL,
    cost_center_id INT,
    business_unit_id INT,
    account_code VARCHAR(20) NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (period_id) REFERENCES budget_period(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_center_id) REFERENCES cost_center(id) ON DELETE SET NULL,
    FOREIGN KEY (business_unit_id) REFERENCES business_unit(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    UNIQUE KEY unique_budget_entry (period_id, cost_center_id, business_unit_id, account_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_budget_period ON unit_budget(period_id);
CREATE INDEX idx_budget_cost_center ON unit_budget(cost_center_id);
CREATE INDEX idx_budget_business_unit ON unit_budget(business_unit_id);
CREATE INDEX idx_budget_account ON unit_budget(account_code);
CREATE INDEX idx_period_status ON budget_period(status);
CREATE INDEX idx_period_year ON budget_period(year);
