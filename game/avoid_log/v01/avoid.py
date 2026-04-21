import pygame
import random
import sys

WIDTH, HEIGHT = 400, 600
FPS = 60
PLAYER_SPEED = 5
OBSTACLE_SPEED = 4
SPAWN_INTERVAL = 28

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("avoid_log_01")
clock = pygame.time.Clock()
font_small = pygame.font.SysFont(None, 22)
font_big = pygame.font.SysFont(None, 40)


def new_game():
    return {
        "player": pygame.Rect(WIDTH // 3, HEIGHT - 70, 18, 28),
        "ai": pygame.Rect(WIDTH * 2 // 3, HEIGHT - 70, 18, 28),
        "obstacles": [],
        "spawn_timer": 0,
        "score": 0,
        "ai_hits": 0,
        "game_over": False,
        "frame": 0,
    }


state = new_game()
stars = [[random.randint(0, WIDTH), random.randint(0, HEIGHT), random.randint(1, 3)]
         for _ in range(70)]

running = True
while running:
    clock.tick(FPS)
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r and state["game_over"]:
                state = new_game()

    keys = pygame.key.get_pressed()

    if not state["game_over"]:
        state["frame"] += 1
        p = state["player"]
        a = state["ai"]

        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            p.x -= PLAYER_SPEED
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            p.x += PLAYER_SPEED
        p.x = max(0, min(WIDTH - p.width, p.x))

        # AI: 自機の隣に並走しつつ、迫る障害物から逃げる
        target_x = p.centerx + 60  # プレイヤーの右側に並ぶ基準
        threat = None
        best_dy = 10**9
        for ob in state["obstacles"]:
            dy = a.y - ob.y
            if 0 < dy < 220 and abs(a.centerx - ob.centerx) < 70:
                if dy < best_dy:
                    threat = ob
                    best_dy = dy
        if threat:
            target_x = a.centerx + (40 if a.centerx > threat.centerx else -40)
        target_x = max(a.width // 2, min(WIDTH - a.width // 2, target_x))
        if a.centerx < target_x - 2:
            a.x += PLAYER_SPEED - 1
        elif a.centerx > target_x + 2:
            a.x -= PLAYER_SPEED - 1

        state["spawn_timer"] += 1
        if state["spawn_timer"] >= SPAWN_INTERVAL:
            state["spawn_timer"] = 0
            w = random.randint(14, 28)
            state["obstacles"].append(pygame.Rect(random.randint(0, WIDTH - w), -30, w, w))

        for ob in state["obstacles"][:]:
            ob.y += OBSTACLE_SPEED + state["score"] // 30
            if ob.y > HEIGHT:
                state["obstacles"].remove(ob)
                state["score"] += 1
            elif ob.colliderect(p):
                state["game_over"] = True
            elif ob.colliderect(a):
                state["obstacles"].remove(ob)
                state["ai_hits"] += 1

        for s in stars:
            s[1] += s[2]
            if s[1] > HEIGHT:
                s[1] = 0
                s[0] = random.randint(0, WIDTH)

    # draw
    screen.fill((5, 5, 22))
    for s in stars:
        c = 60 + s[2] * 50
        pygame.draw.circle(screen, (c, c, min(255, c + 30)), (int(s[0]), int(s[1])), s[2])

    # 並走線（プレイヤーとAIの繋がりを視覚化）
    if not state["game_over"]:
        pygame.draw.line(screen, (70, 90, 140),
                         state["player"].center, state["ai"].center, 1)

    for ob in state["obstacles"]:
        pygame.draw.rect(screen, (255, 90, 80), ob)
        pygame.draw.rect(screen, (255, 200, 200), ob, 1)

    pygame.draw.rect(screen, (100, 200, 255), state["player"])
    pygame.draw.rect(screen, (255, 180, 80), state["ai"])

    # ラベル（操作説明ではなく、視覚的な"自分"と"AI"の区別）
    you = font_small.render("you", True, (170, 220, 255))
    ai_label = font_small.render("AI", True, (255, 210, 140))
    screen.blit(you, (state["player"].centerx - you.get_width() // 2, state["player"].y - 18))
    screen.blit(ai_label, (state["ai"].centerx - ai_label.get_width() // 2, state["ai"].y - 18))

    score_txt = font_small.render(f"score {state['score']}   AI hit {state['ai_hits']}",
                                  True, (200, 200, 220))
    screen.blit(score_txt, (10, 10))

    if state["game_over"]:
        over = font_big.render("GAME OVER", True, (255, 240, 240))
        hint = font_small.render("R to restart", True, (200, 200, 220))
        screen.blit(over, (WIDTH // 2 - over.get_width() // 2, HEIGHT // 2 - 30))
        screen.blit(hint, (WIDTH // 2 - hint.get_width() // 2, HEIGHT // 2 + 14))

    pygame.display.flip()

pygame.quit()
sys.exit()
