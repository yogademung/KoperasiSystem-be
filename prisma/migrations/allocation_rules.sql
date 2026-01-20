-- Allocation Rules System Migration
-- Phase 13: Allocation Rules Engine

-- 1. Allocation Rule Table
CREATE TABLE IF NOT EXISTS allocation_rule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    source_account_code VARCHAR(20) NOT NULL,
    allocation_method ENUM('EQUAL', 'REVENUE', 'HEADCOUNT', 'AREA', 'CUSTOM') NOT NULL,
    custom_formula TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES s_user_lpd(USER_ID),
    INDEX idx_source_account (source_account_code),
    INDEX idx_active (is_active),
    INDEX idx_method (allocation_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Allocation Target Table
CREATE TABLE IF NOT EXISTS allocation_target (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_id INT NOT NULL,
    cost_center_id INT NOT NULL,
    target_percentage DECIMAL(5,2),
    fixed_amount DECIMAL(15,2),
    weight DECIMAL(10,2),
    
    FOREIGN KEY (rule_id) REFERENCES allocation_rule(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_center_id) REFERENCES cost_center(id),
    
    UNIQUE KEY unique_rule_target (rule_id, cost_center_id),
    INDEX idx_rule (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Allocation Execution Table
CREATE TABLE IF NOT EXISTS allocation_execution (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_id INT NOT NULL,
    execution_date DATE NOT NULL,
    period_year INT NOT NULL,
    period_month INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    journal_id INT,
    status ENUM('PREVIEW', 'EXECUTED', 'ROLLED_BACK') DEFAULT 'EXECUTED',
    executed_by INT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rolled_back_by INT,
    rolled_back_at TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (rule_id) REFERENCES allocation_rule(id),
    FOREIGN KEY (journal_id) REFERENCES posted_journal(id),
    FOREIGN KEY (executed_by) REFERENCES s_user_lpd(USER_ID),
    FOREIGN KEY (rolled_back_by) REFERENCES s_user_lpd(USER_ID),
    
    INDEX idx_period (period_year, period_month),
    INDEX idx_rule (rule_id),
    INDEX idx_status (status),
    INDEX idx_execution_date (execution_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Allocation Execution Detail Table
CREATE TABLE IF NOT EXISTS allocation_execution_detail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    execution_id INT NOT NULL,
    cost_center_id INT NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2),
    calculation_basis DECIMAL(15,2),
    
    FOREIGN KEY (execution_id) REFERENCES allocation_execution(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_center_id) REFERENCES cost_center(id),
    
    INDEX idx_execution (execution_id),
    INDEX idx_cost_center (cost_center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
