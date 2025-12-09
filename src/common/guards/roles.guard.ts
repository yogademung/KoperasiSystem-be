import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        // Assuming user.role is an object with a name property as per Schema and Strategy include
        return requiredRoles.some((role) => user.role?.roleName === role || user.role?.name === role);
        // Note: Schema says `roleName`. Prompt auth service says `user.role.name`.
        // Schema: Role model has `roleName`.
        // Auth Service prompt: `user.role.name` (Line 155, 177).
        // Discrepancy: Schema uses `roleName`. Auth Service uses `name`.
        // I should check strict schema field name.
        // Schema line 39: `roleName String ... @map("nama_role")`
        // So the property on the backend object will be `roleName`.
        // I will support `roleName`.
    }
}
